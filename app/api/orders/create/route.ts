import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabaseAdmin.from('users').select('id, role, name, email, phone_number').eq('id', user.id).single();
  return data;
}

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `ORD-${date}-${rand}`;
}

async function assignReseller(): Promise<{ id: string; organization_id: string | null } | null> {
  const { data: resellers } = await supabaseAdmin
    .from('users')
    .select('id, organization_id')
    .eq('role', 'RESELLER')
    .eq('is_active', true)
    .is('team_role', null);

  if (!resellers || resellers.length === 0) return null;

  const counts = await Promise.all(
    resellers.map(async (r) => {
      const { count } = await supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_reseller_id', r.id)
        .in('status', ['PENDING', 'CONFIRMED', 'PROCESSING']);
      return { ...r, load: count ?? 0 };
    })
  );

  counts.sort((a, b) => a.load - b.load);
  return counts[0];
}

// POST /api/orders/create — place an order from cart or direct buy
export async function POST(request: NextRequest) {
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'END_USER') return NextResponse.json({ error: 'Only buyers can place orders' }, { status: 403 });

  const body = await request.json();
  const {
    items,           // [{ product_id, product_name, quantity, unit_price }]
    shipping_address,
    payment_method = 'INVOICE',
    notes,
    lead_id,         // optional: link to a quote request lead
    buyer_phone,
    buyer_company,
  } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
  }

  // Validate items and calculate totals
  const enrichedItems: any[] = [];
  let subtotal = 0;

  for (const item of items) {
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, name, price, sku, stock_status')
      .eq('id', item.product_id)
      .single();

    if (!product) {
      return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 404 });
    }

    const unitPrice = item.unit_price ?? product.price;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    enrichedItems.push({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    });
  }

  const tax = Math.round(subtotal * 0.00); // No tax applied by default — reseller adds
  const shipping = 0;
  const total = subtotal + tax + shipping;

  // Auto-assign a reseller
  const reseller = await assignReseller();

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      buyer_user_id: caller.id,
      buyer_name: caller.name,
      buyer_email: caller.email,
      buyer_phone: buyer_phone || caller.phone_number || null,
      buyer_company: buyer_company || null,
      assigned_reseller_id: reseller?.id || null,
      reseller_org_id: reseller?.organization_id || null,
      lead_id: lead_id || null,
      status: 'PENDING',
      items: enrichedItems,
      subtotal,
      tax,
      shipping,
      total,
      shipping_address: shipping_address || null,
      payment_method,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Clear the cart after successful order
  await supabaseAdmin.from('cart_items').delete().eq('user_id', caller.id);

  // Notify the assigned reseller
  if (reseller?.id) {
    await supabaseAdmin.from('notifications').insert({
      user_id: reseller.id,
      notification_type: 'NEW_ORDER',
      title: 'New Order Received',
      message: `${caller.name} placed order ${order.order_number} — Total: $${total.toLocaleString()}.`,
      link: '/reseller/orders',
      read: false,
    });
  }

  // Notify the buyer
  await supabaseAdmin.from('notifications').insert({
    user_id: caller.id,
    notification_type: 'ORDER_PLACED',
    title: 'Order Placed Successfully',
    message: `Your order ${order.order_number} has been received and will be processed shortly.`,
    link: '/end-user/orders',
    read: false,
  });

  return NextResponse.json({ order }, { status: 201 });
}

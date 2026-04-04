import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabaseAdmin.from('users').select('id, role, name, email').eq('id', user.id).single();
  return data;
}

// GET /api/cart — fetch current user's cart with product details
export async function GET(request: NextRequest) {
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .select('*, product:products(id, name, sku, price, currency, stock_status, organization_id, min_order_quantity, product_images(url, display_order))')
    .eq('user_id', caller.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data || [] });
}

// POST /api/cart — add or update item in cart
export async function POST(request: NextRequest) {
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id, quantity = 1 } = await request.json();
  if (!product_id) return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
  if (quantity < 1) return NextResponse.json({ error: 'quantity must be >= 1' }, { status: 400 });

  // Verify product exists
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, name, price, stock_status')
    .eq('id', product_id)
    .single();
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Upsert — update quantity if already in cart
  const { data: existing } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', caller.id)
    .eq('product_id', product_id)
    .single();

  let item;
  if (existing) {
    const { data } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select('*, product:products(id, name, sku, price, currency, stock_status, organization_id, min_order_quantity, product_images(url, display_order))')
      .single();
    item = data;
  } else {
    const { data } = await supabaseAdmin
      .from('cart_items')
      .insert({ user_id: caller.id, product_id, quantity })
      .select('*, product:products(id, name, sku, price, currency, stock_status, organization_id, min_order_quantity, product_images(url, display_order))')
      .single();
    item = data;
  }

  return NextResponse.json({ item }, { status: 201 });
}

// DELETE /api/cart?item_id=xxx — remove one item, or ?clear=true to empty cart
export async function DELETE(request: NextRequest) {
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const item_id = searchParams.get('item_id');
  const clear = searchParams.get('clear') === 'true';

  if (clear) {
    await supabaseAdmin.from('cart_items').delete().eq('user_id', caller.id);
    return NextResponse.json({ success: true });
  }

  if (!item_id) return NextResponse.json({ error: 'item_id or clear=true required' }, { status: 400 });

  await supabaseAdmin.from('cart_items').delete().eq('id', item_id).eq('user_id', caller.id);
  return NextResponse.json({ success: true });
}

// PATCH /api/cart — update quantity of an existing cart item
export async function PATCH(request: NextRequest) {
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { item_id, quantity } = await request.json();
  if (!item_id || quantity === undefined) return NextResponse.json({ error: 'item_id and quantity required' }, { status: 400 });

  if (quantity < 1) {
    await supabaseAdmin.from('cart_items').delete().eq('id', item_id).eq('user_id', caller.id);
    return NextResponse.json({ success: true });
  }

  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity })
    .eq('id', item_id)
    .eq('user_id', caller.id)
    .select('*, product:products(id, name, sku, price, currency, stock_status, organization_id, min_order_quantity, product_images(url, display_order))')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

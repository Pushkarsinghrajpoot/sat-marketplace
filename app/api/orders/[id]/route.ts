import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabaseAdmin.from('users').select('id, role').eq('id', user.id).single();
  return data;
}

// PATCH /api/orders/[id] — reseller updates order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'RESELLER' && caller.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('id, assigned_reseller_id, buyer_user_id, order_number, status')
    .eq('id', id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (caller.role === 'RESELLER' && existing.assigned_reseller_id !== caller.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { status, notes } = body;

  const update: Record<string, any> = {};
  if (status) update.status = status;
  if (notes !== undefined) update.notes = notes;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Notify buyer of status change
  if (existing.buyer_user_id && status && status !== existing.status) {
    const statusMessages: Record<string, string> = {
      CONFIRMED:  `Order ${existing.order_number} confirmed — your reseller is processing it.`,
      PROCESSING: `Order ${existing.order_number} is now being processed.`,
      SHIPPED:    `Order ${existing.order_number} has been shipped!`,
      DELIVERED:  `Order ${existing.order_number} delivered. Thank you for your order.`,
      CANCELLED:  `Order ${existing.order_number} was cancelled.`,
    };
    if (statusMessages[status]) {
      await supabaseAdmin.from('notifications').insert({
        user_id: existing.buyer_user_id,
        notification_type: 'ORDER_UPDATE',
        title: `Order ${status.charAt(0) + status.slice(1).toLowerCase()}`,
        message: statusMessages[status],
        link: `/end-user/orders/${id}`,
        read: false,
      });
    }
  }

  return NextResponse.json({ order });
}

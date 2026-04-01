import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getCallerReseller(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabaseAdmin.from('users').select('id, role').eq('id', user.id).single();
  return data;
}

// PATCH /api/leads/[id] — reseller updates status / response
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caller = await getCallerReseller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'RESELLER' && caller.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Verify the lead belongs to this reseller
  const { data: existing } = await supabaseAdmin
    .from('customer_leads')
    .select('id, assigned_reseller_id, buyer_user_id, buyer_name')
    .eq('id', id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  if (caller.role === 'RESELLER' && existing.assigned_reseller_id !== caller.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { status, response_notes } = body;

  const update: Record<string, any> = {};
  if (status) update.status = status;
  if (response_notes !== undefined) update.response_notes = response_notes;
  if (status && ['CONTACTED', 'QUOTED', 'WON', 'LOST', 'CLOSED'].includes(status)) {
    update.responded_at = new Date().toISOString();
  }

  const { data: lead, error } = await supabaseAdmin
    .from('customer_leads')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Notify the buyer if they have an account
  if (existing.buyer_user_id && status === 'QUOTED') {
    await supabaseAdmin.from('notifications').insert({
      user_id: existing.buyer_user_id,
      notification_type: 'QUOTE_READY',
      title: 'Your Quote is Ready',
      message: `A reseller has responded to your quote request. Check your inquiries.`,
      link: '/end-user/my-leads',
      read: false,
    });
  }

  return NextResponse.json({ lead });
}

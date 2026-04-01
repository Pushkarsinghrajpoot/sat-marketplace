import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const { data: callerRecord } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (callerRecord?.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, phone_number, is_active, created_at, organization_id, organizations!organization_id(name, type, verified)')
      .in('role', ['RESELLER', 'DISTRIBUTOR', 'END_USER'])
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getCallerReseller(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, role, organization_id')
    .eq('id', user.id)
    .single();
  return data;
}

// GET /api/reseller/products — list own reseller-listed products
export async function GET(request: NextRequest) {
  const caller = await getCallerReseller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'RESELLER' && caller.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*, product_images(*), product_tech_specs(*)')
    .eq('organization_id', caller.organization_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ products: products || [] });
}

// POST /api/reseller/products — create a new reseller product
export async function POST(request: NextRequest) {
  const caller = await getCallerReseller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'RESELLER' && caller.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const {
    name, brand, description, short_description,
    price, min_order_quantity, stock_status,
    category_id, key_features, is_featured, is_trending,
    status = 'ACTIVE',
  } = body;

  if (!name || !price) {
    return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
  }

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({
      name,
      brand,
      description,
      short_description,
      price: Number(price),
      min_order_quantity: Number(min_order_quantity) || 1,
      stock_status: stock_status || 'IN_STOCK',
      category_id: category_id || null,
      key_features: key_features || [],
      is_featured: Boolean(is_featured),
      is_trending: Boolean(is_trending),
      status,
      organization_id: caller.organization_id,
      view_count: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product }, { status: 201 });
}

// PATCH /api/reseller/products — update own product (pass id in body)
export async function PATCH(request: NextRequest) {
  const caller = await getCallerReseller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'RESELLER' && caller.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('id, organization_id')
    .eq('id', id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (caller.role === 'RESELLER' && existing.organization_id !== caller.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product });
}

// DELETE /api/reseller/products — archive own product (pass id in query)
export async function DELETE(request: NextRequest) {
  const caller = await getCallerReseller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'RESELLER' && caller.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('id, organization_id')
    .eq('id', id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (caller.role === 'RESELLER' && existing.organization_id !== caller.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from('products')
    .update({ status: 'ARCHIVED' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, organizationId, changeType, quantityChange, notes, createdBy } = body;

    if (!productId || !organizationId || !changeType || quantityChange === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch current inventory
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, inventory, low_stock_threshold, name')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const quantityBefore = product.inventory ?? 0;
    const quantityAfter = Math.max(0, quantityBefore + quantityChange);

    // Determine stock_status
    let stockStatus = 'IN_STOCK';
    if (quantityAfter === 0) stockStatus = 'OUT_OF_STOCK';
    else if (quantityAfter <= (product.low_stock_threshold ?? 10)) stockStatus = 'LOW_STOCK';

    // Update product inventory + stock_status
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        inventory: quantityAfter,
        stock_status: stockStatus,
        availability: stockStatus === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    // Write inventory log
    const { error: logError } = await supabaseAdmin
      .from('inventory_logs')
      .insert({
        product_id: productId,
        organization_id: organizationId,
        change_type: changeType,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        quantity_change: quantityChange,
        notes: notes || null,
        created_by: createdBy || null,
      });

    if (logError) console.error('Log write failed (non-fatal):', logError);

    return NextResponse.json({
      success: true,
      quantityBefore,
      quantityAfter,
      stockStatus,
    });
  } catch (error) {
    console.error('Inventory adjust error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { supabase } from './supabase';

export async function convertDealToDirectQuery(
  dealId: string,
  distributorId: string,
  userId: string
) {
  try {
    // Fetch the original deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      throw new Error('Deal not found');
    }

    // Create direct query from deal data
    const { data: query, error: queryError } = await supabase
      .from('direct_queries')
      .insert({
        reseller_id: deal.reseller_id,
        reseller_organization_id: deal.reseller_organization_id,
        distributor_id: distributorId,
        title: deal.opportunity_name,
        requirement: deal.notes || `Converted from deal registration: ${deal.opportunity_name}`,
        estimated_budget: deal.estimated_value,
        urgency: 'MEDIUM',
        status: 'OPEN',
        source_deal_id: dealId,
        visibility: 'PRIVATE',
      })
      .select()
      .single();

    if (queryError) {
      throw queryError;
    }

    // Update original deal to mark as converted
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        converted_to_query: true,
        converted_to_query_at: new Date().toISOString(),
      })
      .eq('id', dealId);

    if (updateError) {
      throw updateError;
    }

    return { success: true, queryId: query.id };
  } catch (error) {
    console.error('Error converting deal to query:', error);
    return { success: false, error };
  }
}

export async function convertDealToBidding(dealId: string, userId?: string) {
  try {
    // Update deal visibility and conversion status
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        converted_to_bidding: true,
        converted_to_bidding_at: new Date().toISOString(),
        visibility: 'PUBLIC',
      })
      .eq('id', dealId);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error converting deal to bidding:', error);
    return { success: false, error };
  }
}

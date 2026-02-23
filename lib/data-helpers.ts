import { supabase } from './supabase';

export async function getOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }

  return data || [];
}

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export async function getDeals(filters?: { userId?: string; organizationId?: string; dealType?: string }) {
  let query = supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.or(`reseller_id.eq.${filters.userId},distributor_id.eq.${filters.userId},end_user_id.eq.${filters.userId}`);
  }

  if (filters?.organizationId) {
    query = query.eq('reseller_organization_id', filters.organizationId);
  }

  if (filters?.dealType) {
    query = query.eq('deal_type', filters.dealType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching deals:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export async function getDealActivities(dealId: string) {
  const { data, error } = await supabase
    .from('deal_activities')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deal activities:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export async function getDirectQueries(filters?: { userId?: string; organizationId?: string }) {
  let query = supabase
    .from('direct_queries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.or(`reseller_id.eq.${filters.userId},distributor_id.eq.${filters.userId}`);
  }

  if (filters?.organizationId) {
    query = query.eq('reseller_organization_id', filters.organizationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching direct queries:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export async function getQuotes(filters?: { dealId?: string; distributorId?: string }) {
  let query = supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.dealId) {
    query = query.eq('deal_id', filters.dealId);
  }

  if (filters?.distributorId) {
    query = query.eq('distributor_id', filters.distributorId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching quotes:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  return data || [];
}

export async function getDealStats(userId?: string, organizationId?: string) {
  const deals = await getDeals({ userId, organizationId });

  const stats = {
    total: deals.length,
    active: deals.filter(d => d.status === 'ACTIVE' || d.status === 'PENDING').length,
    won: deals.filter(d => d.status === 'WON').length,
    lost: deals.filter(d => d.status === 'LOST').length,
    totalValue: deals.reduce((sum, d) => sum + (d.deal_value || 0), 0),
  };

  return stats;
}

export async function createDeal(dealData: any) {
  const { data, error } = await supabase
    .from('deals')
    .insert([dealData])
    .select()
    .single();

  if (error) {
    console.error('Error creating deal:', error);
    throw error;
  }

  return data;
}

export async function updateDeal(dealId: string, updates: any) {
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    console.error('Error updating deal:', error);
    throw error;
  }

  return data;
}

export async function createDealActivity(activityData: any) {
  const { data, error } = await supabase
    .from('deal_activities')
    .insert([activityData])
    .select()
    .single();

  if (error) {
    console.error('Error creating activity:', error);
    throw error;
  }

  return data;
}

export async function createDirectQuery(queryData: any) {
  const { data, error } = await supabase
    .from('direct_queries')
    .insert([queryData])
    .select()
    .single();

  if (error) {
    console.error('Error creating direct query:', error);
    throw error;
  }

  return data;
}

export async function createQuote(quoteData: any) {
  const { data, error } = await supabase
    .from('quotes')
    .insert([quoteData])
    .select()
    .single();

  if (error) {
    console.error('Error creating quote:', error);
    throw error;
  }

  return data;
}

export async function updateQuote(quoteId: string, updates: any) {
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', quoteId)
    .select()
    .single();

  if (error) {
    console.error('Error updating quote:', error);
    throw error;
  }

  return data;
}

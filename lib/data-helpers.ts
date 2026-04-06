import { supabase } from './supabase';
import { sendNotification } from './notification-client';
import {
  mapUser,
  mapOrganization,
  mapDeal,
  mapProduct,
  mapQuote,
  mapCampaign,
  mapCategory,
  mapDirectQuery,
  mapEngagementRequest,
  mapCreditRequest,
  mapArray,
  mapBOQ, // Import mapBOQ function
} from './data-mappers';

export async function getOrganizations(filters?: { type?: string }) {
  let query = supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }

  return mapArray(data || [], mapOrganization);
}

export async function getDistributors() {
  return getOrganizations({ type: 'DISTRIBUTOR' });
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

  return mapArray(data || [], mapUser);
}

export async function getDeals(filters?: { 
  userId?: string; 
  organizationId?: string; 
  dealType?: string;
  userRole?: string;
  distributorId?: string;
  customerEmail?: string;
}) {
  let query = supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.eq('reseller_id', filters.userId);
  }

  if (filters?.customerEmail) {
    query = query.eq('customer_email', filters.customerEmail);
  }

  if (filters?.organizationId) {
    query = query.eq('reseller_organization_id', filters.organizationId);
  }

  if (filters?.dealType) {
    query = query.eq('deal_type', filters.dealType);
  }

  // Visibility control for distributors
  if (filters?.userRole === 'DISTRIBUTOR') {
    // Distributors can only see PUBLIC deals or deals they're engaged with
    query = query.or('visibility.eq.PUBLIC,visibility.eq.DISTRIBUTOR');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching deals:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  // Additional filtering for distributor-specific deals
  if (filters?.userRole === 'DISTRIBUTOR' && filters?.distributorId && data) {
    // Filter to only show deals where this distributor is engaged
    const filteredData = await Promise.all(
      data.map(async (deal) => {
        // For BIDDING deals (PUBLIC visibility), check engagement table
        // For DEAL_REGISTRATION (DISTRIBUTOR visibility), also check engagement table
        // This ensures distributors only see deals they're specifically invited to
        
        const { data: engagement } = await supabase
          .from('deal_engaged_distributors')
          .select('id')
          .eq('deal_id', deal.id)
          .eq('distributor_id', filters.distributorId)
          .single();
        
        return engagement ? deal : null;
      })
    );
    
    return mapArray(filteredData.filter(Boolean) as any[], mapDeal);
  }

  return mapArray(data || [], mapDeal);
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

export async function getDirectQueries(filters?: { 
  userId?: string; 
  organizationId?: string;
  userRole?: string;
  distributorId?: string;
}) {
  let query = supabase
    .from('direct_queries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.eq('reseller_id', filters.userId);
  }

  if (filters?.organizationId) {
    query = query.eq('reseller_organization_id', filters.organizationId);
  }

  // Visibility control for distributors
  if (filters?.userRole === 'DISTRIBUTOR' && filters?.distributorId) {
    // Distributors can only see PUBLIC queries or queries specifically for them
    query = query.or(`visibility.eq.PUBLIC,and(visibility.eq.PRIVATE,distributor_id.eq.${filters.distributorId})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching direct queries:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  return mapArray(data || [], mapDirectQuery);
}

export async function getQuotes(filters?: { dealId?: string; distributorId?: string }) {
  let query = supabase
    .from('quotes')
    .select(`
      *,
      deals!inner(*),
      organizations!quotes_distributor_id_fkey(*),
      users!quotes_reseller_id_fkey(*),
      quote_line_items(*)
    `)
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

  return mapArray(data || [], mapQuote);
}

export async function getBOQs(filters?: { distributorId?: string; visibility?: string; excludeAccepted?: boolean }) {
  let query = supabase
    .from('boqs')
    .select(`
      *,
      deals!inner(*),
      users!boqs_reseller_id_fkey(*),
      boq_items(*),
      boq_invited_distributors(*)
    `)
    .order('created_at', { ascending: false });

  // BOQs are visible to distributors based on visibility settings
  if (filters?.distributorId) {
    query = query.or(`visibility.eq.BIDDING,visibility.eq.PROTECTED`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching BOQs:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  let boqs = mapArray(data || [], mapBOQ);

  // Filter out BOQs that have accepted/won quotes if requested
  if (filters?.excludeAccepted) {
    const boqIds = boqs.map(b => b.id);
    
    if (boqIds.length > 0) {
      const { data: wonQuotes } = await supabase
        .from('quotes')
        .select('boq_id')
        .in('boq_id', boqIds)
        .eq('status', 'WON');
      
      const wonBoqIds = new Set(wonQuotes?.map(q => q.boq_id) || []);
      boqs = boqs.filter(b => !wonBoqIds.has(b.id));
    }
  }

  return boqs;
}

export async function createEngagementRequest(requestData: any) {
  const { data, error } = await supabase
    .from('engagement_requests')
    .insert([requestData])
    .select()
    .single();

  if (error) {
    console.error('Error creating engagement request:', error);
    throw error;
  }

  return data;
}

export async function updateEngagementRequest(requestId: string, updates: any, userId: string) {
  const { data, error } = await supabase
    .from('engagement_requests')
    .update(updates)
    .eq('id', requestId)
    .select('*, deals(*)')
    .single();

  if (error) {
    console.error('Error updating engagement request:', error);
    throw error;
  }

  // If approved, update deal activity and notify reseller
  if (updates.status === 'ACCEPTED') {
    await supabase.from('deal_activities').insert({
      deal_id: data.deal_id,
      reseller_id: data.reseller_id,
      activity_type: 'MEETING',
      title: 'Engagement Request Approved',
      description: data.message,
      status: 'ACKNOWLEDGED',
      acknowledged_by: userId,
      acknowledged_at: new Date().toISOString(),
      points: 10,
    });

    // Notify reseller with email
    await sendNotification({
      userId: data.reseller_id,
      notificationType: 'ENGAGEMENT_APPROVED',
      title: 'Engagement Request Approved',
      message: `Your engagement request for "${data.deals?.opportunity_name}" has been approved.`,
      link: `/reseller/deals/${data.deal_id}`,
      emailData: {
        dealName: data.deals?.opportunity_name || 'your deal',
      },
    });
  }

  // If declined, notify reseller with email
  if (updates.status === 'DECLINED') {
    await sendNotification({
      userId: data.reseller_id,
      notificationType: 'ENGAGEMENT_DECLINED',
      title: 'Engagement Request Declined',
      message: `Your engagement request for "${data.deals?.opportunity_name}" has been declined. Reason: ${updates.decline_reason || 'No reason provided'}`,
      link: `/reseller/deals/${data.deal_id}`,
      emailData: {
        dealName: data.deals?.opportunity_name || 'your deal',
        reason: updates.decline_reason || 'No reason provided',
      },
    });
  }

  return data;
}

export async function getEngagementRequests(filters?: { distributorId?: string; resellerId?: string; status?: string }) {
  let query = supabase
    .from('engagement_requests')
    .select('*, deals(*), users(*)')
    .order('created_at', { ascending: false });

  if (filters?.distributorId) {
    query = query.eq('distributor_id', filters.distributorId);
  }

  if (filters?.resellerId) {
    query = query.eq('reseller_id', filters.resellerId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching engagement requests:', error);
    return [];
  }

  // Map engagement requests and nested objects
  return mapArray(data || [], (item) => ({
    ...mapEngagementRequest(item),
    deals: mapDeal(item.deals),
    users: mapUser(item.users),
  }));
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
  console.log('=== CREATE DEAL START ===');
  console.log('Deal data being inserted:', JSON.stringify(dealData, null, 2));
  
  const { data, error } = await supabase
    .from('deals')
    .insert([dealData])
    .select()
    .single();

  if (error) {
    console.error('=== CREATE DEAL ERROR ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    console.error('Error code:', error.code);
    throw new Error(`Failed to create deal: ${error.message}. Details: ${error.details || 'None'}`);
  }

  console.log('=== CREATE DEAL SUCCESS ===');
  console.log('Created deal data:', JSON.stringify(data, null, 2));

  return mapDeal(data);
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

  return mapDeal(data);
}

export async function convertDealToBidding(dealId: string, userId: string) {
  console.log('Converting deal to bidding:', { dealId, userId });
  
  // First, get the current deal to understand its current status
  const { data: currentDeal, error: fetchError } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching current deal:', fetchError);
    throw fetchError;
  }
  
  console.log('Current deal status:', currentDeal.status);
  
  // Try updating without status change first, then update status separately
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .update({
      deal_type: 'BIDDING',
      converted_to_bidding: true,
      converted_to_bidding_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select()
    .single();

  if (dealError) {
    console.error('Error converting deal to bidding (step 1):', dealError);
    console.error('Error details:', JSON.stringify(dealError, null, 2));
    throw dealError;
  }
  
  // Now try to update status separately if needed
  if (currentDeal.status !== 'ACTIVE') {
    const { error: statusError } = await supabase
      .from('deals')
      .update({ status: 'ACTIVE' })
      .eq('id', dealId);
      
    if (statusError) {
      console.error('Error updating deal status:', statusError);
      console.error('Status error details:', JSON.stringify(statusError, null, 2));
      // Don't throw here - the conversion succeeded, just status update failed
      console.warn('Deal converted to bidding but status update failed');
    }
  }

  // Create notification for reseller with email
  await sendNotification({
    userId: userId,
    notificationType: 'DEAL_CONVERTED',
    title: 'Deal Converted to Bidding',
    message: `Your deal "${deal.opportunity_name}" has been converted to bidding and is now open for quotes.`,
    link: `/reseller/deals/${dealId}`,
    emailData: {
      dealName: deal.opportunity_name,
    },
  });

  // Create activity record
  await supabase.from('deal_activities').insert({
    deal_id: dealId,
    reseller_id: userId,
    activity_type: 'MEETING',
    title: 'Deal Converted to Bidding',
    description: 'Deal registration successfully converted to bidding deal',
    status: 'ACKNOWLEDGED',
    points: 20,
  });

  return mapDeal(deal);
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

  // Automatically update deal status to QUOTED when a quote is created
  if (data && quoteData.deal_id) {
    try {
      await supabase
        .from('deals')
        .update({ status: 'QUOTED' })
        .eq('id', quoteData.deal_id);
    } catch (updateError) {
      console.error('Error updating deal status:', updateError);
      // Don't throw - quote was created successfully
    }
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

  // When a quote is submitted, update the deal status to QUOTED
  if (data && updates.status === 'SUBMITTED' && data.deal_id) {
    try {
      await supabase
        .from('deals')
        .update({ status: 'QUOTED' })
        .eq('id', data.deal_id);
    } catch (updateError) {
      console.error('Error updating deal status:', updateError);
      // Don't throw - quote was updated successfully
    }
  }

  return data;
}

// Product Management
export async function getProducts(filters?: { distributorId?: string; category?: string; status?: string }) {
  let query = supabase
    .from('products')
    .select('*, product_images(*)')
    .order('created_at', { ascending: false });

  if (filters?.distributorId) {
    query = query.eq('organization_id', filters.distributorId);
  }

  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  return mapArray(data || [], mapProduct);
}

export async function createProduct(productData: any) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return mapProduct(data);
}

export async function updateProduct(productId: string, updates: any) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
}

// Organization Management
export async function updateOrganization(orgId: string, updates: any) {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', orgId)
    .select()
    .single();

  if (error) {
    console.error('Error updating organization:', error);
    throw error;
  }

  return data;
}

// Configuration Management
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Remove duplicates based on id
  const uniqueCategories = data ? Array.from(new Map(data.map(item => [item.id, item])).values()) : [];
  
  return mapArray(uniqueCategories, mapCategory);
}

export async function createCategory(categoryData: any) {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
}

export async function updateCategory(categoryId: string, updates: any) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data;
}

export async function deleteCategory(categoryId: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function getQualificationBands() {
  const { data, error } = await supabase
    .from('qualification_bands')
    .select('*')
    .order('min_revenue', { ascending: true });

  if (error) {
    console.error('Error fetching qualification bands:', error);
    return [];
  }

  return data || [];
}

export async function createQualificationBand(bandData: any) {
  const { data, error } = await supabase
    .from('qualification_bands')
    .insert([bandData])
    .select()
    .single();

  if (error) {
    console.error('Error creating qualification band:', error);
    throw error;
  }

  return data;
}

export async function updateQualificationBand(bandId: string, updates: any) {
  const { data, error } = await supabase
    .from('qualification_bands')
    .update(updates)
    .eq('id', bandId)
    .select()
    .single();

  if (error) {
    console.error('Error updating qualification band:', error);
    throw error;
  }

  return data;
}

// Campaign Management
export async function getCampaigns(filters?: { distributorId?: string }) {
  let query = supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.distributorId) {
    query = query.eq('distributor_id', filters.distributorId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }

  return mapArray(data || [], mapCampaign);
}

export async function getCampaign(campaignId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }

  return mapCampaign(data);
}

export async function createCampaign(campaignData: any) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaignData])
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }

  return mapCampaign(data);
}

export async function updateCampaign(campaignId: string, updates: any) {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single();

  if (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }

  return mapCampaign(data);
}

// Platform Configuration
export async function getPlatformConfig() {
  const { data, error } = await supabase
    .from('platform_config')
    .select('*')
    .order('config_key', { ascending: true });

  if (error) {
    console.error('Error fetching platform config:', error);
    return [];
  }

  return data || [];
}

export async function getPlatformConfigByKey(key: string) {
  const { data, error } = await supabase
    .from('platform_config')
    .select('*')
    .eq('config_key', key)
    .single();

  if (error) {
    console.error(`Error fetching config ${key}:`, error);
    return null;
  }

  return data;
}

export async function updatePlatformConfig(key: string, value: string) {
  const { data, error } = await supabase
    .from('platform_config')
    .update({ config_value: value })
    .eq('config_key', key)
    .select()
    .single();

  if (error) {
    console.error(`Error updating config ${key}:`, error);
    throw error;
  }

  return data;
}

export async function createPlatformConfig(configData: any) {
  const { data, error } = await supabase
    .from('platform_config')
    .insert([configData])
    .select()
    .single();

  if (error) {
    console.error('Error creating platform config:', error);
    throw error;
  }

  return data;
}

// Individual record lookups
export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return null;
  }

  return mapCategory(data);
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }

  return mapProduct(data);
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }

  return mapUser(data);
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    // Not found is expected for new users
    return null;
  }

  return mapUser(data);
}

export async function getOrganizationById(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching organization ${id}:`, error);
    return null;
  }

  return mapOrganization(data);
}

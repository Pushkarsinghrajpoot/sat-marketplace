/**
 * Data Mappers - Convert database snake_case to TypeScript camelCase
 * Database uses snake_case, TypeScript uses camelCase
 * These functions ensure proper field mapping to prevent NaN and undefined values
 */

export function mapUser(dbUser: any): any {
  if (!dbUser) return null;
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatar: dbUser.avatar,
    organizationId: dbUser.organization_id,
    role: dbUser.role,
    phoneNumber: dbUser.phone_number,
    isActive: dbUser.is_active,
    lastLoginAt: dbUser.last_login_at,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
}

export function mapOrganization(dbOrg: any): any {
  if (!dbOrg) return null;
  return {
    id: dbOrg.id,
    name: dbOrg.name,
    legalName: dbOrg.legal_name,
    type: dbOrg.type,
    logo: dbOrg.logo,
    description: dbOrg.description,
    industry: dbOrg.industry,
    companySize: dbOrg.company_size,
    yearEstablished: dbOrg.year_established,
    website: dbOrg.website,
    verified: dbOrg.verified,
    rating: dbOrg.rating,
    reviewCount: dbOrg.review_count,
    addressCountry: dbOrg.address_country,
    addressStreet: dbOrg.address_street,
    addressCity: dbOrg.address_city,
    addressState: dbOrg.address_state,
    addressPostalCode: dbOrg.address_postal_code,
    contactPhone: dbOrg.contact_phone,
    contactAltPhone: dbOrg.contact_alt_phone,
    contactSupportEmail: dbOrg.contact_support_email,
    contactSalesEmail: dbOrg.contact_sales_email,
    socialLinkedin: dbOrg.social_linkedin,
    socialTwitter: dbOrg.social_twitter,
    socialFacebook: dbOrg.social_facebook,
    createdAt: dbOrg.created_at,
    updatedAt: dbOrg.updated_at,
  };
}

export function mapDeal(dbDeal: any): any {
  if (!dbDeal) return null;
  return {
    id: dbDeal.id,
    dealType: dbDeal.deal_type || 'BIDDING',
    resellerId: dbDeal.reseller_id,
    resellerOrganizationId: dbDeal.reseller_organization_id,
    customerEmail: dbDeal.customer_email || '',
    customerName: dbDeal.customer_name || 'Unknown Customer',
    customerCompany: dbDeal.customer_company || '',
    customerContact: dbDeal.customer_contact || '',
    opportunityName: dbDeal.opportunity_name || 'Untitled Opportunity',
    estimatedValue: dbDeal.estimated_value ? Number(dbDeal.estimated_value) : 0,
    closeDate: dbDeal.close_date || '',
    status: dbDeal.status || 'DRAFT',
    priority: dbDeal.priority || 'NORMAL',
    score: dbDeal.score ? Number(dbDeal.score) : 0,
    isLocked: dbDeal.is_locked || false,
    lockedBy: dbDeal.locked_by,
    lockedAt: dbDeal.locked_at,
    isVerified: dbDeal.is_verified || false,
    verificationToken: dbDeal.verification_token,
    verifiedAt: dbDeal.verified_at,
    declarationAccepted: dbDeal.declaration_accepted || false,
    declarationSignature: dbDeal.declaration_signature || '',
    declarationAcceptedAt: dbDeal.declaration_accepted_at,
    convertedToBidding: dbDeal.converted_to_bidding || false,
    convertedToBiddingAt: dbDeal.converted_to_bidding_at,
    parentDealId: dbDeal.parent_deal_id,
    wonQuoteId: dbDeal.won_quote_id,
    notes: dbDeal.notes || '',
    createdAt: dbDeal.created_at,
    updatedAt: dbDeal.updated_at,
  };
}

export function mapProduct(dbProduct: any): any {
  if (!dbProduct) return null;
  return {
    id: dbProduct.id,
    organizationId: dbProduct.organization_id,
    name: dbProduct.name,
    sku: dbProduct.sku,
    categoryId: dbProduct.category_id,
    brand: dbProduct.brand,
    description: dbProduct.description,
    shortDescription: dbProduct.short_description,
    price: dbProduct.price,
    currency: dbProduct.currency,
    inventory: dbProduct.inventory,
    lowStockThreshold: dbProduct.low_stock_threshold,
    availability: dbProduct.availability,
    leadTime: dbProduct.lead_time,
    status: dbProduct.status,
    views: dbProduct.views,
    featured: dbProduct.featured,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
}

export function mapQuote(dbQuote: any): any {
  if (!dbQuote) return null;
  return {
    id: dbQuote.id,
    quoteType: dbQuote.quote_type,
    boqId: dbQuote.boq_id,
    dealId: dbQuote.deal_id,
    queryId: dbQuote.query_id,
    distributorId: dbQuote.distributor_id,
    resellerId: dbQuote.reseller_id,
    recipientUserId: dbQuote.recipient_user_id,
    recipientRole: dbQuote.recipient_role,
    subtotal: dbQuote.subtotal,
    discount: dbQuote.discount,
    tax: dbQuote.tax,
    shipping: dbQuote.shipping,
    total: dbQuote.total,
    status: dbQuote.status,
    paymentTermsNetDays: dbQuote.payment_terms_net_days,
    paymentTermsMethod: dbQuote.payment_terms_method,
    paymentTermsEarlyDiscount: dbQuote.payment_terms_early_discount,
    deliveryTermsEstimatedDelivery: dbQuote.delivery_terms_estimated_delivery,
    deliveryTermsMethod: dbQuote.delivery_terms_method,
    deliveryTermsLocation: dbQuote.delivery_terms_location,
    deliveryTermsIncoterms: dbQuote.delivery_terms_incoterms,
    validUntil: dbQuote.valid_until,
    submittedAt: dbQuote.submitted_at,
    createdAt: dbQuote.created_at,
    updatedAt: dbQuote.updated_at,
  };
}

export function mapCampaign(dbCampaign: any): any {
  if (!dbCampaign) return null;
  return {
    id: dbCampaign.id,
    distributorId: dbCampaign.distributor_id,
    name: dbCampaign.name,
    description: dbCampaign.description,
    campaignType: dbCampaign.campaign_type,
    startDate: dbCampaign.start_date,
    endDate: dbCampaign.end_date,
    status: dbCampaign.status,
    bannerImage: dbCampaign.banner_image,
    targetAudienceType: dbCampaign.target_audience_type,
    incentiveType: dbCampaign.incentive_type,
    incentiveDiscount: dbCampaign.incentive_discount,
    incentiveFreeShipping: dbCampaign.incentive_free_shipping,
    incentiveExtendedWarranty: dbCampaign.incentive_extended_warranty,
    incentivePaymentTerms: dbCampaign.incentive_payment_terms,
    goalTargetRevenue: dbCampaign.goal_target_revenue,
    goalTargetEngagements: dbCampaign.goal_target_engagements,
    goalTargetConversions: dbCampaign.goal_target_conversions,
    analyticsViews: dbCampaign.analytics_views,
    analyticsEngagements: dbCampaign.analytics_engagements,
    analyticsQuotes: dbCampaign.analytics_quotes,
    analyticsConversions: dbCampaign.analytics_conversions,
    analyticsRevenue: dbCampaign.analytics_revenue,
    createdAt: dbCampaign.created_at,
    updatedAt: dbCampaign.updated_at,
  };
}

export function mapCategory(dbCategory: any): any {
  if (!dbCategory) return null;
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    description: dbCategory.description,
    status: dbCategory.status,
    productCount: dbCategory.product_count,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at,
  };
}

export function mapDirectQuery(dbQuery: any): any {
  if (!dbQuery) return null;
  return {
    id: dbQuery.id,
    resellerId: dbQuery.reseller_id,
    resellerOrganizationId: dbQuery.reseller_organization_id,
    distributorId: dbQuery.distributor_id,
    title: dbQuery.title || 'Untitled Query',
    requirement: dbQuery.requirement || '',
    estimatedBudget: dbQuery.estimated_budget ? Number(dbQuery.estimated_budget) : 0,
    urgency: dbQuery.urgency || 'MEDIUM',
    status: dbQuery.status || 'OPEN',
    createdAt: dbQuery.created_at,
    updatedAt: dbQuery.updated_at,
  };
}

export function mapEngagementRequest(dbEngagement: any): any {
  if (!dbEngagement) return null;
  return {
    id: dbEngagement.id,
    resellerId: dbEngagement.reseller_id,
    distributorId: dbEngagement.distributor_id,
    dealId: dbEngagement.deal_id,
    message: dbEngagement.message,
    status: dbEngagement.status,
    declineReason: dbEngagement.decline_reason,
    quoteId: dbEngagement.quote_id,
    createdAt: dbEngagement.created_at,
    updatedAt: dbEngagement.updated_at,
  };
}

export function mapCreditRequest(dbCredit: any): any {
  if (!dbCredit) return null;
  return {
    id: dbCredit.id,
    resellerId: dbCredit.reseller_id,
    distributorId: dbCredit.distributor_id,
    amount: dbCredit.amount,
    terms: dbCredit.terms,
    status: dbCredit.status,
    approvedLimit: dbCredit.approved_limit,
    reviewNotes: dbCredit.review_notes,
    createdAt: dbCredit.created_at,
    updatedAt: dbCredit.updated_at,
  };
}

export function mapQuoteLineItem(dbLineItem: any): any {
  if (!dbLineItem) return null;
  return {
    id: dbLineItem.id,
    quoteId: dbLineItem.quote_id,
    productId: dbLineItem.product_id,
    productName: dbLineItem.product_name,
    sku: dbLineItem.sku,
    quantity: dbLineItem.quantity,
    unitPrice: dbLineItem.unit_price,
    discount: dbLineItem.discount,
    subtotal: dbLineItem.subtotal,
    createdAt: dbLineItem.created_at,
  };
}

// Helper to map arrays
export function mapArray<T>(dbArray: any[], mapFn: (item: any) => T): T[] {
  if (!Array.isArray(dbArray)) return [];
  return dbArray.map(mapFn).filter(Boolean);
}

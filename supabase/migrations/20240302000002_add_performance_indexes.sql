-- Migration: Add performance indexes for frequently queried columns
-- Improves query performance across the marketplace application

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Organizations table indexes
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_verified ON organizations(verified);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_reseller_id ON deals(reseller_id);
CREATE INDEX IF NOT EXISTS idx_deals_reseller_organization_id ON deals(reseller_organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_is_locked ON deals(is_locked);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);

-- Campaigns table indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_distributor_id ON campaigns(distributor_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);

-- Quotes table indexes
CREATE INDEX IF NOT EXISTS idx_quotes_distributor_id ON quotes(distributor_id);
CREATE INDEX IF NOT EXISTS idx_quotes_reseller_id ON quotes(reseller_id);
CREATE INDEX IF NOT EXISTS idx_quotes_deal_id ON quotes(deal_id);
CREATE INDEX IF NOT EXISTS idx_quotes_boq_id ON quotes(boq_id);
CREATE INDEX IF NOT EXISTS idx_quotes_query_id ON quotes(query_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_type ON quotes(quote_type);

-- Direct queries table indexes
CREATE INDEX IF NOT EXISTS idx_direct_queries_reseller_id ON direct_queries(reseller_id);
CREATE INDEX IF NOT EXISTS idx_direct_queries_distributor_id ON direct_queries(distributor_id);
CREATE INDEX IF NOT EXISTS idx_direct_queries_status ON direct_queries(status);
CREATE INDEX IF NOT EXISTS idx_direct_queries_created_at ON direct_queries(created_at DESC);

-- BOQs table indexes
CREATE INDEX IF NOT EXISTS idx_boqs_deal_id ON boqs(deal_id);
CREATE INDEX IF NOT EXISTS idx_boqs_reseller_id ON boqs(reseller_id);
CREATE INDEX IF NOT EXISTS idx_boqs_created_at ON boqs(created_at DESC);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- Engagement requests indexes
CREATE INDEX IF NOT EXISTS idx_engagement_requests_reseller_id ON engagement_requests(reseller_id);
CREATE INDEX IF NOT EXISTS idx_engagement_requests_distributor_id ON engagement_requests(distributor_id);
CREATE INDEX IF NOT EXISTS idx_engagement_requests_deal_id ON engagement_requests(deal_id);
CREATE INDEX IF NOT EXISTS idx_engagement_requests_status ON engagement_requests(status);

-- Credit requests indexes
CREATE INDEX IF NOT EXISTS idx_credit_requests_reseller_id ON credit_requests(reseller_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_distributor_id ON credit_requests(distributor_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_status ON credit_requests(status);

-- Deal activities indexes
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_reseller_id ON deal_activities(reseller_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_status ON deal_activities(status);
CREATE INDEX IF NOT EXISTS idx_deal_activities_activity_type ON deal_activities(activity_type);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Quote line items indexes
CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_id ON quote_line_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_product_id ON quote_line_items(product_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deals_reseller_status ON deals(reseller_id, status);
CREATE INDEX IF NOT EXISTS idx_deals_type_status ON deals(deal_type, status);
CREATE INDEX IF NOT EXISTS idx_products_org_status ON products(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_dist_status ON quotes(distributor_id, status);

-- Add comments for documentation
COMMENT ON INDEX idx_deals_reseller_status IS 'Composite index for reseller dashboard queries';
COMMENT ON INDEX idx_deals_type_status IS 'Composite index for deal type and status filtering';
COMMENT ON INDEX idx_products_org_status IS 'Composite index for organization product listings';

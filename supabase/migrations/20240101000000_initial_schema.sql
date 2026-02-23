-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE organization_type AS ENUM ('DISTRIBUTOR', 'RESELLER', 'OEM', 'INDIVIDUAL');
CREATE TYPE user_role AS ENUM ('RESELLER', 'DISTRIBUTOR', 'END_USER', 'PLATFORM_ADMIN');
CREATE TYPE deal_type AS ENUM ('DEAL_REGISTRATION', 'BIDDING', 'DIRECT_QUERY');
CREATE TYPE deal_status AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'PENDING_DECLARATION', 'ACTIVE', 'CONVERTED_TO_BIDDING', 'QUOTED', 'WON', 'LOST');
CREATE TYPE deal_priority AS ENUM ('NORMAL', 'GOLD');
CREATE TYPE quote_type AS ENUM ('NORMAL', 'BIDDING');
CREATE TYPE quote_status AS ENUM ('TO_SUBMIT', 'SUBMITTED', 'UNDER_REVIEW', 'WON', 'LOST', 'EXPIRED');
CREATE TYPE activity_type AS ENUM ('MEETING', 'DEMO', 'BOQ_REVISION');
CREATE TYPE activity_status AS ENUM ('PENDING', 'ACKNOWLEDGED', 'REJECTED');
CREATE TYPE query_urgency AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE query_status AS ENUM ('OPEN', 'RESPONDED', 'CLOSED');
CREATE TYPE product_status AS ENUM ('ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED');
CREATE TYPE campaign_status AS ENUM ('ACTIVE', 'SCHEDULED', 'ENDED');
CREATE TYPE engagement_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
CREATE TYPE credit_request_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE boq_visibility AS ENUM ('PROTECTED', 'BIDDING');

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    type organization_type NOT NULL,
    logo TEXT,
    description TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    year_established INTEGER,
    website TEXT,
    verified BOOLEAN DEFAULT false,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    address_country VARCHAR(100),
    address_street TEXT,
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_postal_code VARCHAR(20),
    contact_phone VARCHAR(50),
    contact_alt_phone VARCHAR(50),
    contact_support_email VARCHAR(255),
    contact_sales_email VARCHAR(255),
    social_linkedin TEXT,
    social_twitter TEXT,
    social_facebook TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role user_role NOT NULL,
    phone_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    product_count INTEGER DEFAULT 0,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    description TEXT,
    short_description TEXT,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    inventory INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    availability VARCHAR(50) DEFAULT 'IN_STOCK',
    lead_time VARCHAR(100),
    status product_status DEFAULT 'DRAFT',
    views INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product specifications table
CREATE TABLE product_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    spec_group VARCHAR(100),
    label VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    unit VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product documents table
CREATE TABLE product_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    document_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product tags table
CREATE TABLE product_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volume pricing table
CREATE TABLE volume_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    price DECIMAL(12,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_type deal_type NOT NULL,
    reseller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reseller_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_company VARCHAR(255),
    customer_contact VARCHAR(50),
    opportunity_name VARCHAR(255) NOT NULL,
    estimated_value DECIMAL(12,2),
    close_date DATE,
    status deal_status DEFAULT 'DRAFT',
    priority deal_priority DEFAULT 'NORMAL',
    score INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT false,
    locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    verified_at TIMESTAMPTZ,
    declaration_accepted BOOLEAN DEFAULT false,
    declaration_signature TEXT,
    declaration_accepted_at TIMESTAMPTZ,
    converted_to_bidding BOOLEAN DEFAULT false,
    converted_to_bidding_at TIMESTAMPTZ,
    parent_deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    won_quote_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal products table
CREATE TABLE deal_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal engaged distributors table
CREATE TABLE deal_engaged_distributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    engaged_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deal_id, distributor_id)
);

-- Deal activities table
CREATE TABLE deal_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    reseller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    points INTEGER DEFAULT 0,
    scheduled_date TIMESTAMPTZ,
    status activity_status DEFAULT 'PENDING',
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOQ table
CREATE TABLE boqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    reseller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    visibility boq_visibility NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOQ items table
CREATE TABLE boq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID REFERENCES boqs(id) ON DELETE CASCADE,
    product_sku VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    specifications TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOQ invited distributors table
CREATE TABLE boq_invited_distributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID REFERENCES boqs(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(boq_id, distributor_id)
);

-- Direct queries table
CREATE TABLE direct_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reseller_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    requirement TEXT NOT NULL,
    estimated_budget DECIMAL(12,2),
    urgency query_urgency DEFAULT 'MEDIUM',
    status query_status DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct query products table
CREATE TABLE direct_query_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID REFERENCES direct_queries(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct query responses table
CREATE TABLE direct_query_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID REFERENCES direct_queries(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    quote_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct query response attachments table
CREATE TABLE direct_query_response_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID REFERENCES direct_query_responses(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_type quote_type NOT NULL,
    boq_id UUID REFERENCES boqs(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    query_id UUID REFERENCES direct_queries(id) ON DELETE SET NULL,
    distributor_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    reseller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_role user_role,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    shipping DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    status quote_status DEFAULT 'TO_SUBMIT',
    payment_terms_net_days INTEGER DEFAULT 30,
    payment_terms_method VARCHAR(100),
    payment_terms_early_discount DECIMAL(5,2),
    delivery_terms_estimated_delivery DATE,
    delivery_terms_method VARCHAR(100),
    delivery_terms_location TEXT,
    delivery_terms_incoterms VARCHAR(50),
    valid_until DATE,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote line items table
CREATE TABLE quote_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote messages table
CREATE TABLE quote_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote message attachments table
CREATE TABLE quote_message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES quote_messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    status campaign_status DEFAULT 'SCHEDULED',
    banner_image TEXT,
    target_audience_type VARCHAR(50),
    incentive_type VARCHAR(100),
    incentive_discount DECIMAL(5,2),
    incentive_free_shipping BOOLEAN DEFAULT false,
    incentive_extended_warranty BOOLEAN DEFAULT false,
    incentive_payment_terms INTEGER,
    goal_target_revenue DECIMAL(12,2),
    goal_target_engagements INTEGER,
    goal_target_conversions INTEGER,
    analytics_views INTEGER DEFAULT 0,
    analytics_engagements INTEGER DEFAULT 0,
    analytics_quotes INTEGER DEFAULT 0,
    analytics_conversions INTEGER DEFAULT 0,
    analytics_revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign products table
CREATE TABLE campaign_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagement requests table
CREATE TABLE engagement_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    message TEXT,
    status engagement_status DEFAULT 'PENDING',
    decline_reason TEXT,
    quote_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagement request products table
CREATE TABLE engagement_request_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID REFERENCES engagement_requests(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit requests table
CREATE TABLE credit_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    terms TEXT,
    status credit_request_status DEFAULT 'PENDING',
    approved_limit DECIMAL(12,2),
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit request documents table
CREATE TABLE credit_request_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_request_id UUID REFERENCES credit_requests(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    to_org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    pricing_rating INTEGER CHECK (pricing_rating >= 1 AND pricing_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    support_rating INTEGER CHECK (support_rating >= 1 AND support_rating <= 5),
    review TEXT,
    anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rating tags table
CREATE TABLE rating_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating_id UUID REFERENCES ratings(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_organization_id ON products(organization_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_deals_reseller_id ON deals(reseller_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_deal_type ON deals(deal_type);
CREATE INDEX idx_deals_locked_by ON deals(locked_by);
CREATE INDEX idx_deals_parent_deal_id ON deals(parent_deal_id);
CREATE INDEX idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX idx_boqs_deal_id ON boqs(deal_id);
CREATE INDEX idx_direct_queries_reseller_id ON direct_queries(reseller_id);
CREATE INDEX idx_direct_queries_status ON direct_queries(status);
CREATE INDEX idx_quotes_deal_id ON quotes(deal_id);
CREATE INDEX idx_quotes_distributor_id ON quotes(distributor_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_activities_updated_at BEFORE UPDATE ON deal_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boqs_updated_at BEFORE UPDATE ON boqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_direct_queries_updated_at BEFORE UPDATE ON direct_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_engagement_requests_updated_at BEFORE UPDATE ON engagement_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_requests_updated_at BEFORE UPDATE ON credit_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

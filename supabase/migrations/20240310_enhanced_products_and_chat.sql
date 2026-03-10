-- =====================================================
-- Enhanced Product Schema Migration
-- =====================================================

-- Drop existing product-related tables if needed for clean migration
-- Note: Be careful in production, this is for development

-- Add new columns to products table for comprehensive information
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS model_number VARCHAR,
  ADD COLUMN IF NOT EXISTS manufacturer VARCHAR,
  ADD COLUMN IF NOT EXISTS key_features TEXT[],
  ADD COLUMN IF NOT EXISTS compatibility_details TEXT,
  ADD COLUMN IF NOT EXISTS performance_specs JSONB,
  ADD COLUMN IF NOT EXISTS power_requirements TEXT,
  ADD COLUMN IF NOT EXISTS hardware_requirements TEXT,
  ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS stock_status VARCHAR DEFAULT 'IN_STOCK',
  ADD COLUMN IF NOT EXISTS delivery_timeline VARCHAR,
  ADD COLUMN IF NOT EXISTS warranty_info TEXT,
  ADD COLUMN IF NOT EXISTS warranty_period INTEGER,
  ADD COLUMN IF NOT EXISTS warranty_type VARCHAR,
  ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_type VARCHAR,
  ADD COLUMN IF NOT EXISTS technical_support_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS demo_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS installation_available BOOLEAN DEFAULT false;

-- Create product services table
CREATE TABLE IF NOT EXISTS product_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  service_type VARCHAR NOT NULL, -- 'INSTALLATION', 'CONFIGURATION', 'DEPLOYMENT', 'EXTENDED_WARRANTY', 'AMC'
  service_name VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC,
  duration VARCHAR,
  is_included BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product technical specs table (more structured)
CREATE TABLE IF NOT EXISTS product_tech_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  spec_category VARCHAR NOT NULL, -- 'PERFORMANCE', 'HARDWARE', 'SOFTWARE', 'NETWORK', 'SECURITY'
  spec_name VARCHAR NOT NULL,
  spec_value TEXT NOT NULL,
  spec_unit VARCHAR,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR,
  review_text TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product documents table
CREATE TABLE IF NOT EXISTS product_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  url TEXT NOT NULL,
  document_type VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product tags table
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Chat System Schema
-- =====================================================

-- Create chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_type VARCHAR NOT NULL, -- 'PRODUCT_INQUIRY', 'QUOTE_REQUEST', 'TECHNICAL_SUPPORT', 'SERVICE_REQUEST'
  status VARCHAR DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSED', 'ARCHIVED'
  subject VARCHAR,
  product_id UUID REFERENCES products(id),
  deal_id UUID REFERENCES deals(id),
  quote_id UUID REFERENCES quotes(id),
  boq_id UUID REFERENCES boqs(id),
  customer_id UUID REFERENCES users(id), -- End customer/reseller initiating chat
  agent_id UUID REFERENCES users(id), -- Support agent handling chat
  reseller_id UUID REFERENCES users(id), -- Reseller involved
  distributor_id UUID REFERENCES organizations(id), -- Distributor involved
  priority VARCHAR DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  sender_role VARCHAR NOT NULL, -- 'CUSTOMER', 'AGENT', 'RESELLER', 'DISTRIBUTOR'
  message_type VARCHAR DEFAULT 'TEXT', -- 'TEXT', 'FILE', 'QUOTE', 'BOQ', 'SYSTEM'
  message_text TEXT,
  metadata JSONB, -- For storing additional data like quote details, file info, etc.
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat attachments table
CREATE TABLE IF NOT EXISTS chat_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name VARCHAR NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat participants table (for tracking who is in conversation)
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR NOT NULL, -- 'CUSTOMER', 'AGENT', 'RESELLER', 'DISTRIBUTOR'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(conversation_id, user_id)
);

-- =====================================================
-- Product Request/Inquiry Tables
-- =====================================================

-- Create product inquiries table (for "Ask Technical Question")
CREATE TABLE IF NOT EXISTS product_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  inquiry_type VARCHAR NOT NULL, -- 'TECHNICAL', 'PRICING', 'AVAILABILITY', 'DEMO', 'GENERAL'
  subject VARCHAR NOT NULL,
  question TEXT NOT NULL,
  status VARCHAR DEFAULT 'OPEN', -- 'OPEN', 'ANSWERED', 'CLOSED'
  response TEXT,
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create demo requests table
CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  preferred_date TIMESTAMP WITH TIME ZONE,
  preferred_time VARCHAR,
  location_type VARCHAR, -- 'ONLINE', 'ONSITE', 'OFFICE'
  location_details TEXT,
  attendee_count INTEGER DEFAULT 1,
  special_requirements TEXT,
  status VARCHAR DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
  confirmed_date TIMESTAMP WITH TIME ZONE,
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_trending ON products(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_organization ON products(organization_id);

CREATE INDEX IF NOT EXISTS idx_product_services_product ON product_services(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_tech_specs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_customer ON chat_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_agent ON chat_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_conversation ON chat_participants(conversation_id);

CREATE INDEX IF NOT EXISTS idx_product_inquiries_product ON product_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_demo_requests_product ON demo_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_demo_requests_user ON demo_requests(user_id);

-- =====================================================
-- Triggers
-- =====================================================

-- Update conversation last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Update product view count
CREATE OR REPLACE FUNCTION increment_product_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps
CREATE TRIGGER update_product_services_updated_at
BEFORE UPDATE ON product_services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON chat_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_inquiries_updated_at
BEFORE UPDATE ON product_inquiries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_requests_updated_at
BEFORE UPDATE ON demo_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Sample Data / Comments
-- =====================================================

COMMENT ON TABLE product_services IS 'Services that can be bundled with products (installation, configuration, etc.)';
COMMENT ON TABLE product_tech_specs IS 'Structured technical specifications for products';
COMMENT ON TABLE chat_conversations IS 'Main chat conversation threads between customers, agents, resellers, and distributors';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat conversations';
COMMENT ON TABLE product_inquiries IS 'Technical and general inquiries about products';
COMMENT ON TABLE demo_requests IS 'Product demonstration requests from customers';

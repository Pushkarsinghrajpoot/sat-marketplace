-- Platform Configuration Tables
-- Run this after the initial schema and RLS policies

-- Create configuration table for platform settings
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE',
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qualification bands table
CREATE TABLE IF NOT EXISTS qualification_bands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  min_revenue DECIMAL,
  max_revenue DECIMAL,
  discount_percentage DECIMAL,
  benefits JSONB,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description, status, product_count) VALUES
('Networking & Infrastructure', 'networking-infrastructure', 'Networking hardware and infrastructure solutions', 'ACTIVE', 0),
('Cloud Services', 'cloud-services', 'Cloud computing and SaaS solutions', 'ACTIVE', 0),
('Cybersecurity', 'cybersecurity', 'Security solutions and services', 'ACTIVE', 0),
('Storage Solutions', 'storage-solutions', 'Data storage and backup solutions', 'ACTIVE', 0),
('Software Licensing', 'software-licensing', 'Software licenses and subscriptions', 'ACTIVE', 0)
ON CONFLICT (slug) DO NOTHING;

-- Insert default qualification bands
INSERT INTO qualification_bands (name, min_revenue, max_revenue, discount_percentage, status) VALUES
('Bronze Partner', 0, 100000, 5, 'ACTIVE'),
('Silver Partner', 100000, 500000, 10, 'ACTIVE'),
('Gold Partner', 500000, 2000000, 15, 'ACTIVE'),
('Platinum Partner', 2000000, NULL, 25, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Add RLS policies for configuration tables
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_bands ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage platform_config" ON platform_config
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'PLATFORM_ADMIN')
  );

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'PLATFORM_ADMIN')
  );

CREATE POLICY "Admins can manage qualification_bands" ON qualification_bands
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'PLATFORM_ADMIN')
  );

-- Everyone can read categories and bands
CREATE POLICY "Everyone can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Everyone can read qualification_bands" ON qualification_bands
  FOR SELECT USING (true);

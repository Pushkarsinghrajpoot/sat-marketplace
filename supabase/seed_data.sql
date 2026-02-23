-- ========================================
-- SUPABASE USER CREATION SCRIPT
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Insert Organizations First
INSERT INTO organizations (id, name, legal_name, type, verified, description, website, year_established, rating, review_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'TechDist Global', 'TechDist Global Inc.', 'DISTRIBUTOR', true, 'Leading IT distributor', 'https://techdist.example.com', 2008, 4.8, 250),
('550e8400-e29b-41d4-a716-446655440002', 'NetSupply Corp', 'NetSupply Corporation', 'DISTRIBUTOR', true, 'Network equipment specialist', 'https://netsupply.example.com', 2012, 4.6, 180),
('550e8400-e29b-41d4-a716-446655440003', 'CloudFirst Distribution', 'CloudFirst Distribution LLC', 'DISTRIBUTOR', true, 'Cloud solutions distributor', 'https://cloudfirst.example.com', 2015, 4.7, 145),
('550e8400-e29b-41d4-a716-446655440004', 'ABC Resellers Inc', 'ABC Resellers Incorporated', 'RESELLER', true, 'IT reseller and system integrator', 'https://abcresellers.example.com', 2016, 4.5, 92),
('550e8400-e29b-41d4-a716-446655440005', 'Premier Solutions Group', 'Premier Solutions Group Ltd', 'RESELLER', true, 'Enterprise IT solutions', 'https://premiersolutions.example.com', 2017, 4.6, 78),
('550e8400-e29b-41d4-a716-446655440007', 'B2B Marketplace', 'B2B Marketplace Platform', 'DISTRIBUTOR', true, 'Platform operator', 'https://marketplace.satmz.com', 2023, 5.0, 0)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create Auth Users and Application Users

-- USER 1: John Smith (Distributor)
DO $$
DECLARE
  user_id UUID := '550e8400-e29b-41d4-a716-446655440101';
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    'john@techdist.satmz.com',
    crypt('Test123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert into users table
  INSERT INTO users (
    id,
    email,
    name,
    organization_id,
    role,
    phone_number,
    is_active
  ) VALUES (
    user_id,
    'john@techdist.satmz.com',
    'John Smith',
    '550e8400-e29b-41d4-a716-446655440001',
    'DISTRIBUTOR',
    '+1-555-0101',
    true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- USER 2: Sarah Johnson (End User)
DO $$
DECLARE
  user_id UUID := '550e8400-e29b-41d4-a716-446655440102';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
    'sarah@techdist.satmz.com', crypt('Test123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, email, name, organization_id, role, phone_number, is_active) VALUES (
    user_id, 'sarah@techdist.satmz.com', 'Sarah Johnson', 
    '550e8400-e29b-41d4-a716-446655440001', 'END_USER', '+1-555-0102', true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- USER 3: Mike Davis (Distributor)
DO $$
DECLARE
  user_id UUID := '550e8400-e29b-41d4-a716-446655440103';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
    'mike@netsupply.satmz.com', crypt('Test123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, email, name, organization_id, role, phone_number, is_active) VALUES (
    user_id, 'mike@netsupply.satmz.com', 'Mike Davis',
    '550e8400-e29b-41d4-a716-446655440002', 'DISTRIBUTOR', '+1-555-0103', true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- USER 4: Emily Wilson (Distributor)
DO $$
DECLARE
  user_id UUID := '550e8400-e29b-41d4-a716-446655440104';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
    'emily@cloudfirst.satmz.com', crypt('Test123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, email, name, organization_id, role, phone_number, is_active) VALUES (
    user_id, 'emily@cloudfirst.satmz.com', 'Emily Wilson',
    '550e8400-e29b-41d4-a716-446655440003', 'DISTRIBUTOR', '+1-555-0104', true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- USER 5: Robert Brown (Reseller) ⭐ PRIMARY TEST USER
DO $$
DECLARE
  user_id UUID := '550e8400-e29b-41d4-a716-446655440105';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
    'robert@abcresellers.satmz.com', crypt('Test123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, email, name, organization_id, role, phone_number, is_active) VALUES (
    user_id, 'robert@abcresellers.satmz.com', 'Robert Brown',
    '550e8400-e29b-41d4-a716-446655440004', 'RESELLER', '+1-555-0105', true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- USER 6: Lisa Martinez (Reseller)
DO $$
DECLARE
  user_id UUID := '550e8400-e29b-41d4-a716-446655440106';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
    'lisa@premiersolutions.satmz.com', crypt('Test123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, email, name, organization_id, role, phone_number, is_active) VALUES (
    user_id, 'lisa@premiersolutions.satmz.com', 'Lisa Martinez',
    '550e8400-e29b-41d4-a716-446655440005', 'RESELLER', '+1-555-0106', true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- USER 7: End User Demo (End User)
DO $$
DECLARE
  user_id UUID := '550e8400-e29b-41d4-a716-446655440107';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
    'enduser@abcresellers.satmz.com', crypt('Test123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, email, name, organization_id, role, phone_number, is_active) VALUES (
    user_id, 'enduser@abcresellers.satmz.com', 'End User Demo',
    '550e8400-e29b-41d4-a716-446655440004', 'END_USER', '+1-555-0107', true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- USER 8: Admin User (Platform Admin)
DO $$
DECLARE
  user_id UUID := '550e8400-e29b-41d4-a716-446655440100';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
    'admin@marketplace.satmz.com', crypt('Admin123!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, email, name, organization_id, role, phone_number, is_active) VALUES (
    user_id, 'admin@marketplace.satmz.com', 'Admin User',
    '550e8400-e29b-41d4-a716-446655440007', 'PLATFORM_ADMIN', '+1-555-0100', true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- Verify the data
SELECT 'Organizations created:' as status, COUNT(*) as count FROM organizations;
SELECT 'Auth users created:' as status, COUNT(*) as count FROM auth.users WHERE email LIKE '%satmz.com';
SELECT 'App users created:' as status, COUNT(*) as count FROM users;

-- Show all created users
SELECT 
  u.email,
  u.name,
  u.role,
  o.name as organization,
  u.is_active
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
ORDER BY u.email;

# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: marketplace-aws
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
5. Wait for project to be ready (~2 minutes)

## Step 2: Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
   - **service_role key**: Long string starting with `eyJ...` (keep this secret!)

## Step 3: Configure Environment Variables

1. Create `.env.local` file in project root (copy from `.env.local.example`)
2. Add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from `supabase/migrations/20240101000000_initial_schema.sql`
4. Paste and click **Run**
5. Wait for success message
6. Click **New Query** again
7. Copy entire content from `supabase/migrations/20240101000001_rls_policies.sql`
8. Paste and click **Run**
9. Verify all tables are created in **Table Editor**

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure:
   - ✅ Enable Email provider
   - ✅ Confirm email (optional, can disable for testing)
   - ✅ Secure email change
4. Save

## Step 6: Create Test Users Manually

### Method 1: Using Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - **Email**: (use emails from CREDENTIALS.md)
   - **Password**: `Test123!` (or your choice)
   - ✅ Auto Confirm User (check this for testing)
4. Click **Create User**
5. Note the user's UUID (you'll need this)

### Method 2: Using SQL Editor

Run this query for each user (replace values):

```sql
-- Insert into auth.users (Supabase Auth)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'robert@abcresellers.satmz.com',
  crypt('Test123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  'authenticated'
);

-- Get the user ID that was just created
SELECT id, email FROM auth.users WHERE email = 'robert@abcresellers.satmz.com';

-- Then insert into your users table (use the ID from above)
INSERT INTO users (
  id,
  email,
  name,
  organization_id,
  role,
  phone_number,
  is_active
) VALUES (
  'uuid-from-above',  -- Replace with actual UUID
  'robert@abcresellers.satmz.com',
  'Robert Brown',
  'org4',  -- Must exist in organizations table
  'RESELLER',
  '+1-555-0105',
  true
);
```

## Step 7: Create Required Users

Create these users for testing (from CREDENTIALS.md):

### 1. Reseller User
```
Email: robert@abcresellers.satmz.com
Password: Test123!
Name: Robert Brown
Role: RESELLER
Organization: org4
```

### 2. Distributor User
```
Email: john@techdist.satmz.com
Password: Test123!
Name: John Smith
Role: DISTRIBUTOR
Organization: org1
```

### 3. End User
```
Email: enduser@abcresellers.satmz.com
Password: Test123!
Name: End User Demo
Role: END_USER
Organization: org4
```

### 4. Platform Admin
```
Email: admin@marketplace.satmz.com
Password: Admin123!
Name: Admin User
Role: PLATFORM_ADMIN
Organization: org7
```

## Step 8: Insert Organizations

Before creating users, ensure organizations exist:

```sql
-- Insert organizations
INSERT INTO organizations (id, name, legal_name, type, verified) VALUES
('org1', 'TechDist Global', 'TechDist Global Inc.', 'DISTRIBUTOR', true),
('org2', 'NetSupply Corp', 'NetSupply Corporation', 'DISTRIBUTOR', true),
('org3', 'CloudFirst Distribution', 'CloudFirst Distribution LLC', 'DISTRIBUTOR', true),
('org4', 'ABC Resellers Inc', 'ABC Resellers Incorporated', 'RESELLER', true),
('org5', 'Premier Solutions Group', 'Premier Solutions Group Ltd', 'RESELLER', true),
('org7', 'B2B Marketplace', 'B2B Marketplace Platform', 'DISTRIBUTOR', true);
```

## Step 9: Verify Setup

1. Go to **Table Editor** and check:
   - ✅ `organizations` table has data
   - ✅ `users` table has data
   - ✅ User IDs match between `auth.users` and `users` table

2. Go to **Authentication** → **Users**
   - ✅ See your created users
   - ✅ Email confirmed status is green

## Step 10: Test Login

1. Start your Next.js app: `npm run dev`
2. Go to `http://localhost:3001/auth/login`
3. Try logging in with:
   - Email: `robert@abcresellers.satmz.com`
   - Password: `Test123!`
4. Should redirect to `/reseller/dashboard`

## Troubleshooting

### Users table is empty after auth signup
- Make sure to insert into both `auth.users` AND your custom `users` table
- The `id` must match between both tables

### RLS policies blocking access
- Check that RLS is enabled: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
- Verify policies exist: Go to **Authentication** → **Policies**
- For testing, you can temporarily disable RLS on specific tables

### Cannot insert into auth.users
- Use the SQL Editor, not the Table Editor
- auth.users is a protected table
- Use `crypt()` function for passwords

### Email confirmation required
- In **Authentication** → **Providers** → **Email**
- Uncheck "Confirm email" for testing
- Or manually confirm: Check "Auto Confirm User" when creating

## Next Steps

After setup is complete:
1. Install Supabase client: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
2. The app will automatically use Supabase for authentication
3. All data will be stored in Supabase database instead of localStorage

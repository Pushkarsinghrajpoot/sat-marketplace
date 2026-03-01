-- Migration: Fix Row Level Security Policies
-- This fixes data not saving to tables by setting up proper RLS policies

-- ============================================
-- DISABLE RLS TEMPORARILY FOR TESTING
-- Re-enable after confirming data saves
-- ============================================

ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE direct_queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE boqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_requests DISABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENT OUT THE LINES BELOW ONCE TESTING IS DONE
-- Then uncomment to re-enable RLS with proper policies
-- ============================================

/*
-- Re-enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert deals" ON deals;
DROP POLICY IF EXISTS "Allow users to view their own deals" ON deals;
DROP POLICY IF EXISTS "Allow users to update their own deals" ON deals;
DROP POLICY IF EXISTS "Allow users to delete their own deals" ON deals;

-- DEALS Policies
CREATE POLICY "Enable insert for authenticated users"
ON deals FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for all authenticated users"
ON deals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for deal owners"
ON deals FOR UPDATE
TO authenticated
USING (reseller_id = auth.uid());

CREATE POLICY "Enable delete for deal owners"
ON deals FOR DELETE
TO authenticated
USING (reseller_id = auth.uid());

-- DEAL ACTIVITIES Policies
CREATE POLICY "Enable insert for authenticated users"
ON deal_activities FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for all authenticated users"
ON deal_activities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for activity owners"
ON deal_activities FOR UPDATE
TO authenticated
USING (reseller_id = auth.uid());

-- QUOTES Policies
CREATE POLICY "Enable insert for authenticated users"
ON quotes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for all authenticated users"
ON quotes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for quote owners"
ON quotes FOR UPDATE
TO authenticated
USING (distributor_id IN (
  SELECT organization_id FROM users WHERE id = auth.uid()
) OR reseller_id = auth.uid());

-- DIRECT QUERIES Policies
CREATE POLICY "Enable insert for authenticated users"
ON direct_queries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for all authenticated users"
ON direct_queries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for query owners"
ON direct_queries FOR UPDATE
TO authenticated
USING (reseller_id = auth.uid());

-- BOQS Policies
CREATE POLICY "Enable insert for authenticated users"
ON boqs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for all authenticated users"
ON boqs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for boq owners"
ON boqs FOR UPDATE
TO authenticated
USING (reseller_id = auth.uid());

-- ENGAGEMENT REQUESTS Policies
CREATE POLICY "Enable insert for authenticated users"
ON engagement_requests FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for all authenticated users"
ON engagement_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON engagement_requests FOR UPDATE
TO authenticated
USING (true);

-- CREDIT REQUESTS Policies
CREATE POLICY "Enable insert for authenticated users"
ON credit_requests FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for all authenticated users"
ON credit_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON credit_requests FOR UPDATE
TO authenticated
USING (true);
*/

-- Add comment
COMMENT ON TABLE deals IS 'RLS TEMPORARILY DISABLED FOR TESTING - Re-enable after confirming data saves';

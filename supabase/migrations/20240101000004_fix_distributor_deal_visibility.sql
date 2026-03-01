-- Fix distributor deal visibility
-- Distributors should be able to see all registered deals (DEAL_REGISTRATION) 
-- so they can engage with them, not just BIDDING deals

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Distributors can view deals" ON deals;

-- Create new policy that allows distributors to see:
-- 1. All DEAL_REGISTRATION deals (so they can engage)
-- 2. All BIDDING deals (public)
-- 3. DIRECT_QUERY deals they're engaged with
-- 4. Deals they're already engaged with
CREATE POLICY "Distributors can view deals" ON deals FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'DISTRIBUTOR' AND
    (
        deal_type = 'DEAL_REGISTRATION' OR 
        deal_type = 'BIDDING' OR 
        id IN (
            SELECT deal_id 
            FROM deal_engaged_distributors 
            WHERE distributor_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
        )
    )
);

-- Comment for clarity
COMMENT ON POLICY "Distributors can view deals" ON deals IS 'Allows distributors to view all registered deals for engagement opportunities, bidding deals, and deals they are engaged with';

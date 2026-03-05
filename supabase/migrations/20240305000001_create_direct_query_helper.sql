-- Migration: Add helper function for creating direct queries
-- This ensures direct queries are created in the direct_queries table, not deals table

-- Function to create direct query from deal-like data
CREATE OR REPLACE FUNCTION create_direct_query_from_deal(
  p_reseller_id uuid,
  p_reseller_org_id uuid,
  p_title text,
  p_requirement text,
  p_estimated_budget numeric,
  p_urgency text DEFAULT 'MEDIUM'
) RETURNS uuid AS $$
DECLARE
  v_query_id uuid;
BEGIN
  INSERT INTO direct_queries (
    reseller_id,
    reseller_organization_id,
    title,
    requirement,
    estimated_budget,
    urgency,
    status
  ) VALUES (
    p_reseller_id,
    p_reseller_org_id,
    p_title,
    p_requirement,
    p_estimated_budget,
    p_urgency::query_urgency,
    'OPEN'
  )
  RETURNING id INTO v_query_id;
  
  RETURN v_query_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_direct_query_from_deal IS 'Helper to create direct query instead of deal';

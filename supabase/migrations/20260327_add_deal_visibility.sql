-- Add visibility control to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS visibility VARCHAR DEFAULT 'PRIVATE';

-- Add comment for clarity
COMMENT ON COLUMN deals.visibility IS 'PRIVATE: reseller only, DISTRIBUTOR: specific distributor, PUBLIC: open bidding/converted';

-- Add conversion tracking fields
ALTER TABLE deals ADD COLUMN IF NOT EXISTS converted_to_query BOOLEAN DEFAULT false;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS converted_to_query_at TIMESTAMP WITH TIME ZONE;

-- Add source deal reference to direct_queries
ALTER TABLE direct_queries ADD COLUMN IF NOT EXISTS source_deal_id UUID REFERENCES deals(id);

-- Update existing deals to have proper visibility
UPDATE deals SET visibility = 
  CASE 
    WHEN deal_type = 'BIDDING' OR converted_to_bidding = true THEN 'PUBLIC'
    WHEN deal_type = 'DEAL_REGISTRATION' THEN 'PRIVATE'
    ELSE 'PRIVATE'
  END
WHERE visibility IS NULL;

-- Add visibility to direct_queries
ALTER TABLE direct_queries ADD COLUMN IF NOT EXISTS visibility VARCHAR DEFAULT 'PUBLIC';
COMMENT ON COLUMN direct_queries.visibility IS 'PUBLIC: all distributors, PRIVATE: specific distributor only';

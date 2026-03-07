-- Schema Updates and Missing Fields Migration
-- Run this SQL file in your Supabase SQL Editor

-- ============================================================================
-- 1. Add missing document_type field to credit_request_documents
-- ============================================================================
ALTER TABLE credit_request_documents 
ADD COLUMN IF NOT EXISTS document_type VARCHAR;

COMMENT ON COLUMN credit_request_documents.document_type IS 'Type of document: FINANCIALS, TRADE_LICENSE, BANK_LETTER, etc.';

-- ============================================================================
-- 2. Ensure engagement_requests has proper engagement_type field
-- ============================================================================
ALTER TABLE engagement_requests 
ADD COLUMN IF NOT EXISTS engagement_type VARCHAR;

COMMENT ON COLUMN engagement_requests.engagement_type IS 'Type of engagement: TECHNICAL_MEETING, DEMO_POC, BOQ_REVISION, TECH_DISCUSSION';

-- ============================================================================
-- 3. Add reseller score tracking column if not exists
-- ============================================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_activity_score INTEGER DEFAULT 0;

COMMENT ON COLUMN users.total_activity_score IS 'Total accumulated activity points for reseller users';

-- ============================================================================
-- 4. Create index on deal_activities for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_status ON deal_activities(status);
CREATE INDEX IF NOT EXISTS idx_deal_activities_reseller_id ON deal_activities(reseller_id);

-- ============================================================================
-- 5. Create index on quotes for better query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_quotes_deal_id ON quotes(deal_id);
CREATE INDEX IF NOT EXISTS idx_quotes_distributor_id ON quotes(distributor_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_reseller_id ON quotes(reseller_id);

-- ============================================================================
-- 6. Create index on engagement_requests
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_engagement_requests_distributor_id ON engagement_requests(distributor_id);
CREATE INDEX IF NOT EXISTS idx_engagement_requests_reseller_id ON engagement_requests(reseller_id);
CREATE INDEX IF NOT EXISTS idx_engagement_requests_status ON engagement_requests(status);

-- ============================================================================
-- 7. Create index on credit_requests
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_credit_requests_distributor_id ON credit_requests(distributor_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_reseller_id ON credit_requests(reseller_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_status ON credit_requests(status);

-- ============================================================================
-- 8. Create index on direct_queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_direct_queries_distributor_id ON direct_queries(distributor_id);
CREATE INDEX IF NOT EXISTS idx_direct_queries_reseller_id ON direct_queries(reseller_id);
CREATE INDEX IF NOT EXISTS idx_direct_queries_status ON direct_queries(status);

-- ============================================================================
-- 9. Create index on deals for better filtering
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_reseller_id ON deals(reseller_id);
CREATE INDEX IF NOT EXISTS idx_deals_is_locked ON deals(is_locked);

-- ============================================================================
-- 10. Add RLS (Row Level Security) policies if not already enabled
-- ============================================================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_queries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 11. Create helper function to update reseller total score
-- ============================================================================
CREATE OR REPLACE FUNCTION update_reseller_total_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reseller's total score when activity is acknowledged
  IF NEW.status = 'ACKNOWLEDGED' AND (OLD.status IS NULL OR OLD.status != 'ACKNOWLEDGED') THEN
    UPDATE users
    SET total_activity_score = COALESCE(
      (SELECT SUM(points) FROM deal_activities 
       WHERE reseller_id = NEW.reseller_id AND status = 'ACKNOWLEDGED'),
      0
    )
    WHERE id = NEW.reseller_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. Create trigger for reseller score update
-- ============================================================================
DROP TRIGGER IF EXISTS update_reseller_score_trigger ON deal_activities;

CREATE TRIGGER update_reseller_score_trigger
AFTER INSERT OR UPDATE OF status ON deal_activities
FOR EACH ROW
EXECUTE FUNCTION update_reseller_total_score();

-- ============================================================================
-- 13. Add notification trigger helper function
-- ============================================================================
CREATE OR REPLACE FUNCTION send_activity_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification when activity status changes
  IF NEW.status = 'ACKNOWLEDGED' AND (OLD.status IS NULL OR OLD.status != 'ACKNOWLEDGED') THEN
    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      link
    ) VALUES (
      NEW.reseller_id,
      'ACTIVITY_ACKNOWLEDGED',
      'Activity Acknowledged',
      'Your activity has been acknowledged! You earned ' || NEW.points || ' points.',
      '/reseller/deals/' || NEW.deal_id || '/activities'
    );
  ELSIF NEW.status = 'REJECTED' AND (OLD.status IS NULL OR OLD.status != 'REJECTED') THEN
    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      link
    ) VALUES (
      NEW.reseller_id,
      'ACTIVITY_REJECTED',
      'Activity Rejected',
      COALESCE('Your activity was rejected: ' || NEW.rejection_reason, 'Your activity was rejected'),
      '/reseller/deals/' || NEW.deal_id || '/activities'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 14. Verify enum types exist (create if missing)
-- ============================================================================
DO $$ 
BEGIN
  -- Check and create activity_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE activity_type AS ENUM ('MEETING', 'DEMO', 'BOQ_REVISION');
  END IF;

  -- Check and create activity_status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_status') THEN
    CREATE TYPE activity_status AS ENUM ('PENDING', 'ACKNOWLEDGED', 'REJECTED');
  END IF;

  -- Check and create engagement_status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'engagement_status') THEN
    CREATE TYPE engagement_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;

  -- Check and create credit_request_status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_request_status') THEN
    CREATE TYPE credit_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED');
  END IF;
END $$;

-- ============================================================================
-- 15. Data cleanup and validation
-- ============================================================================

-- Set default points for existing activities that have NULL or 0 points
UPDATE deal_activities 
SET points = 10 
WHERE points IS NULL OR points = 0;

-- Update existing deals to ensure proper score calculation
UPDATE deals
SET score = COALESCE((
  SELECT SUM(points)
  FROM deal_activities
  WHERE deal_id = deals.id
  AND status = 'ACKNOWLEDGED'
), 0)
WHERE deal_type = 'DEAL_REGISTRATION' OR converted_to_bidding = true;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the migration)
-- ============================================================================

-- Check if all indexes were created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('deal_activities', 'quotes', 'engagement_requests', 'credit_requests', 'direct_queries', 'deals')
ORDER BY tablename, indexname;

-- Check if triggers are active
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('deal_activities', 'deals')
ORDER BY event_object_table, trigger_name;

-- Verify activity points
SELECT COUNT(*) as total_activities,
       SUM(CASE WHEN points > 0 THEN 1 ELSE 0 END) as activities_with_points,
       SUM(CASE WHEN status = 'ACKNOWLEDGED' THEN 1 ELSE 0 END) as acknowledged_activities
FROM deal_activities;

-- Verify deal scores
SELECT deal_type,
       COUNT(*) as total_deals,
       AVG(score) as avg_score,
       MAX(score) as max_score
FROM deals
WHERE deal_type IN ('DEAL_REGISTRATION', 'BIDDING')
GROUP BY deal_type;

-- ============================================================================
-- STORAGE BUCKET CREATION (Run in Supabase Dashboard > Storage)
-- ============================================================================
-- NOTE: Storage buckets cannot be created via SQL. 
-- You need to create them manually in the Supabase Dashboard:
-- 1. Go to Storage section in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Create a bucket named: "boqs"
-- 4. Set it to PUBLIC (so distributors can view BOQ files)
-- 5. Add RLS policies for access control

-- After creating the bucket, run these policies via SQL:

-- Allow authenticated users to upload BOQs
CREATE POLICY "Resellers can upload BOQs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'boqs');

-- Allow authenticated users to read BOQs
CREATE POLICY "Users can view BOQs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'boqs');

-- Allow resellers to update their own BOQs
CREATE POLICY "Resellers can update own BOQs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'boqs');

-- Allow resellers to delete their own BOQs
CREATE POLICY "Resellers can delete own BOQs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'boqs');

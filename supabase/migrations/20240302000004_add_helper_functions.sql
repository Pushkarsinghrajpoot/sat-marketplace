-- Migration: Add helper functions and triggers for data consistency
-- Provides automatic updates and data validation

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_direct_queries_updated_at ON direct_queries;
CREATE TRIGGER update_direct_queries_updated_at
  BEFORE UPDATE ON direct_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_boqs_updated_at ON boqs;
CREATE TRIGGER update_boqs_updated_at
  BEFORE UPDATE ON boqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_requests_updated_at ON credit_requests;
CREATE TRIGGER update_credit_requests_updated_at
  BEFORE UPDATE ON credit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_engagement_requests_updated_at ON engagement_requests;
CREATE TRIGGER update_engagement_requests_updated_at
  BEFORE UPDATE ON engagement_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deal_activities_updated_at ON deal_activities;
CREATE TRIGGER update_deal_activities_updated_at
  BEFORE UPDATE ON deal_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update category product count
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update count for old category (if exists)
  IF TG_OP = 'UPDATE' AND OLD.category_id IS NOT NULL THEN
    UPDATE categories 
    SET product_count = (
      SELECT COUNT(*) FROM products WHERE category_id = OLD.category_id
    )
    WHERE id = OLD.category_id;
  END IF;
  
  -- Update count for new category (if exists)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.category_id IS NOT NULL THEN
    UPDATE categories 
    SET product_count = (
      SELECT COUNT(*) FROM products WHERE category_id = NEW.category_id
    )
    WHERE id = NEW.category_id;
  END IF;
  
  -- Update count when product is deleted
  IF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
    UPDATE categories 
    SET product_count = (
      SELECT COUNT(*) FROM products WHERE category_id = OLD.category_id
    )
    WHERE id = OLD.category_id;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply product count trigger
DROP TRIGGER IF EXISTS update_category_count ON products;
CREATE TRIGGER update_category_count
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_category_product_count();

-- Function to validate deal status transitions
CREATE OR REPLACE FUNCTION validate_deal_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow any transition from DRAFT
  IF OLD.status = 'DRAFT' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent going back to DRAFT from other statuses
  IF NEW.status = 'DRAFT' AND OLD.status != 'DRAFT' THEN
    RAISE EXCEPTION 'Cannot change deal status back to DRAFT from %', OLD.status;
  END IF;
  
  -- WON and LOST are terminal states
  IF OLD.status IN ('WON', 'LOST', 'CANCELLED') AND NEW.status != OLD.status THEN
    RAISE EXCEPTION 'Cannot change deal status from terminal state %', OLD.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply deal status validation trigger
DROP TRIGGER IF EXISTS validate_deal_status ON deals;
CREATE TRIGGER validate_deal_status
  BEFORE UPDATE OF status ON deals
  FOR EACH ROW
  EXECUTE FUNCTION validate_deal_status_transition();

-- Add comments
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at timestamp on row modification';
COMMENT ON FUNCTION update_category_product_count() IS 'Keeps category product_count in sync with actual product count';
COMMENT ON FUNCTION validate_deal_status_transition() IS 'Prevents invalid deal status transitions';

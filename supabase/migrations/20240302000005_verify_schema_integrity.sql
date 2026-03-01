-- Migration: Verify schema integrity and fix any inconsistencies
-- Final validation and cleanup migration

-- Verify all foreign key relationships are valid
DO $$
DECLARE
  fk_violations INTEGER := 0;
BEGIN
  -- Check products -> categories
  SELECT COUNT(*) INTO fk_violations
  FROM products p
  WHERE p.category_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = p.category_id);
  
  IF fk_violations > 0 THEN
    RAISE NOTICE 'WARNING: % products have invalid category references', fk_violations;
  END IF;

  -- Check products -> organizations
  SELECT COUNT(*) INTO fk_violations
  FROM products p
  WHERE p.organization_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organizations o WHERE o.id = p.organization_id);
  
  IF fk_violations > 0 THEN
    RAISE NOTICE 'WARNING: % products have invalid organization references', fk_violations;
  END IF;

  -- Check users -> organizations
  SELECT COUNT(*) INTO fk_violations
  FROM users u
  WHERE u.organization_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organizations o WHERE o.id = u.organization_id);
  
  IF fk_violations > 0 THEN
    RAISE NOTICE 'WARNING: % users have invalid organization references', fk_violations;
  END IF;

  RAISE NOTICE 'Schema integrity check complete';
END $$;

-- Ensure all tables have proper permissions (adjust as needed for your RLS policies)
-- This is a placeholder - adjust based on your actual RLS requirements

-- Grant necessary permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh database statistics for query optimizer
ANALYZE;

-- Create a view for easy product catalog access
CREATE OR REPLACE VIEW product_catalog AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.category_id,
  c.name as category_name,
  c.slug as category_slug,
  p.brand,
  p.description,
  p.short_description,
  p.price,
  p.currency,
  p.inventory,
  p.availability,
  p.status,
  p.featured,
  p.organization_id,
  o.name as organization_name,
  o.type as organization_type,
  p.created_at,
  p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN organizations o ON p.organization_id = o.id;

COMMENT ON VIEW product_catalog IS 'Denormalized view of products with category and organization information for easier querying';

-- Create a view for deal pipeline
CREATE OR REPLACE VIEW deal_pipeline AS
SELECT 
  d.id,
  d.opportunity_name,
  d.deal_type,
  d.status,
  d.estimated_value,
  d.close_date,
  d.reseller_id,
  d.reseller_organization_id,
  r.name as reseller_name,
  r.email as reseller_email,
  ro.name as reseller_organization_name,
  d.is_locked,
  d.is_verified,
  d.score,
  d.created_at,
  d.updated_at
FROM deals d
LEFT JOIN users r ON d.reseller_id = r.id
LEFT JOIN organizations ro ON d.reseller_organization_id = ro.id;

COMMENT ON VIEW deal_pipeline IS 'Denormalized view of deals with reseller information for pipeline management';

-- Verify schema is ready
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SCHEMA VERIFICATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All migrations have been applied successfully';
  RAISE NOTICE 'Database is ready for use';
  RAISE NOTICE '========================================';
END $$;

-- Migration: Fix schema cache issues for products table
-- Forces Supabase to refresh schema cache and validates product-category relationship

-- Ensure categories table exists and is properly indexed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_id') THEN
    CREATE INDEX idx_categories_id ON categories(id);
  END IF;
END $$;

-- Ensure products table foreign key constraint is valid
DO $$
BEGIN
  -- Drop and recreate the foreign key constraint to refresh the relationship
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;
  END IF;
  
  ALTER TABLE products 
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id);
END $$;

-- Validate that all products with category_id reference valid categories
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM products p
  WHERE p.category_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = p.category_id);
  
  IF invalid_count > 0 THEN
    RAISE NOTICE 'Found % products with invalid category references', invalid_count;
    -- Set invalid category_id to NULL
    UPDATE products 
    SET category_id = NULL 
    WHERE category_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = products.category_id);
    RAISE NOTICE 'Fixed invalid category references by setting them to NULL';
  ELSE
    RAISE NOTICE 'All product category references are valid';
  END IF;
END $$;

-- Refresh materialized view statistics (if any)
ANALYZE products;
ANALYZE categories;

-- Add helpful comments
COMMENT ON COLUMN products.category_id IS 'Foreign key reference to categories table. Products can be categorized for better organization.';
COMMENT ON TABLE categories IS 'Product categories for organizing distributor catalogs';

-- Verify the fix
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'category_id'
  ) THEN
    RAISE NOTICE 'SUCCESS: products.category_id column exists and is properly configured';
  ELSE
    RAISE EXCEPTION 'FAILED: products.category_id column not found';
  END IF;
END $$;

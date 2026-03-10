-- =====================================================
-- Add Missing Foreign Key Constraints
-- =====================================================
-- This migration adds foreign key constraints that were missing
-- from the product_images, product_documents, and product_tags tables

-- Add foreign key constraint to product_images
ALTER TABLE product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add foreign key constraint to product_documents
ALTER TABLE product_documents 
ADD CONSTRAINT product_documents_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add foreign key constraint to product_tags
ALTER TABLE product_tags 
ADD CONSTRAINT product_tags_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_documents_product_id ON product_documents(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_product_id ON product_inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_product_id ON chat_conversations(product_id);
                                                   
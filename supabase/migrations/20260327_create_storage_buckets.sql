-- Note: This migration is for reference only
-- User already has 'boqs' and will create 'documents' bucket manually
-- 
-- For the 'documents' bucket, use these policies in Supabase Dashboard:

-- Storage policies for documents bucket (qualification docs, etc.)
-- Run these in SQL Editor if bucket policies are not set:

-- CREATE POLICY "Authenticated users can upload documents"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'documents');

-- CREATE POLICY "Users can read documents"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'documents');

-- CREATE POLICY "Users can update their documents"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'documents');

-- CREATE POLICY "Users can delete their documents"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'documents');

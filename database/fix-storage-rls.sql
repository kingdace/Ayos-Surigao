-- Fix Storage RLS Policy for report-images bucket
-- This script makes the bucket public for uploads

-- First, let's check if the bucket exists and make it public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'report-images';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create a simple policy that allows public uploads
-- This is the most permissive approach for now
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'report-images');

-- Also allow updates in case of conflicts
CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'report-images');

-- And allow deletes for cleanup
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'report-images');

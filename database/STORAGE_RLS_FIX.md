# Fix Storage RLS Policy Error

## The Problem

You're getting this error: `StorageApiError: new row violates row-level security policy`

This means the `report-images` bucket exists but the RLS (Row Level Security) policies are blocking uploads.

## Quick Fix - Run This SQL

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Make the bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'report-images';

-- Create permissive policies
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'report-images');

CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'report-images');

CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'report-images');

CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'report-images');
```

## Alternative - Manual Dashboard Fix

1. Go to **Storage** in your Supabase dashboard
2. Find the `report-images` bucket
3. Click on **Settings** (gear icon)
4. Make sure **Public bucket** is **enabled**
5. Go to **Policies** tab
6. Delete any existing policies
7. Create new policies:
   - **Policy Name**: "Allow public uploads"
   - **Operation**: INSERT
   - **Target roles**: public
   - **Policy definition**: `bucket_id = 'report-images'`

## Test the Fix

After running the SQL or manual setup:

1. Try uploading a photo in your app
2. Check the console - should see successful upload logs
3. Check Storage in Supabase dashboard - should see uploaded files

The image upload should work perfectly after this fix!

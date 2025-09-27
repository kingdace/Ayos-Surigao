-- Fix My Barangay - Storage Setup for Images
-- This script sets up Supabase Storage for report images

-- Create the storage bucket for report images
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'report-images',
  'report-images',
  true,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  5242880  -- 5MB limit
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  file_size_limit = 5242880;

-- Storage policies for report images bucket
-- Allow anyone to view images (for public reports)
CREATE POLICY "Anyone can view report images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'report-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload report images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'report-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'reports'
  );

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own report images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'report-images' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to delete their own images (optional)
CREATE POLICY "Users can delete their own report images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'report-images' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Update RLS to enable it on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Ensure our reports table has proper photo_urls column (should already exist)
DO $$ 
BEGIN
    -- Check if photo_urls column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'photo_urls'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN photo_urls TEXT[];
    END IF;
    
    -- Ensure photo_url column exists for backward compatibility
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN photo_url TEXT;
    END IF;
END $$;

-- Create index for faster photo queries
CREATE INDEX IF NOT EXISTS idx_reports_photo_urls ON public.reports USING GIN(photo_urls);
CREATE INDEX IF NOT EXISTS idx_reports_photo_url ON public.reports(photo_url) WHERE photo_url IS NOT NULL;

-- Update the reports view to include photo information
DROP VIEW IF EXISTS public.reports_with_details;
CREATE VIEW public.reports_with_details AS
SELECT 
    r.*,
    -- Reporter information
    CASE 
        WHEN r.is_anonymous THEN 'Anonymous'
        ELSE COALESCE(p.first_name || ' ' || p.last_name, 'Unknown')
    END as reporter_name,
    
    -- Barangay information
    b.name as barangay_display_name,
    
    -- Photo information
    CASE 
        WHEN r.photo_urls IS NOT NULL AND array_length(r.photo_urls, 1) > 0 THEN array_length(r.photo_urls, 1)
        WHEN r.photo_url IS NOT NULL THEN 1
        ELSE 0
    END as photo_count,
    
    -- Combined photo URLs for easy access
    CASE 
        WHEN r.photo_urls IS NOT NULL AND array_length(r.photo_urls, 1) > 0 THEN r.photo_urls
        WHEN r.photo_url IS NOT NULL THEN ARRAY[r.photo_url]
        ELSE ARRAY[]::TEXT[]
    END as all_photo_urls
    
FROM public.reports r
LEFT JOIN public.profiles p ON r.user_id = p.id
LEFT JOIN public.barangays b ON r.barangay_code = b.code;

-- Grant permissions on the view
GRANT SELECT ON public.reports_with_details TO authenticated;
GRANT SELECT ON public.reports_with_details TO anon;

-- Function to clean up old images when a report is deleted
CREATE OR REPLACE FUNCTION delete_report_images()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete associated images from storage
    -- This would need to be handled by a backend service in practice
    -- For now, we'll just log it
    RAISE NOTICE 'Report % deleted. Associated images should be cleaned up: %', 
                 OLD.id, OLD.photo_urls;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cleanup (commented out as it would need proper storage deletion)
-- CREATE TRIGGER cleanup_report_images
--     AFTER DELETE ON public.reports
--     FOR EACH ROW EXECUTE FUNCTION delete_report_images();

COMMENT ON TABLE public.reports IS 'Community reports with image upload support';
COMMENT ON COLUMN public.reports.photo_url IS 'Legacy single photo URL (for backward compatibility)';
COMMENT ON COLUMN public.reports.photo_urls IS 'Array of photo URLs for multiple images per report';
COMMENT ON VIEW public.reports_with_details IS 'Enhanced reports view with photo count and combined photo URLs';

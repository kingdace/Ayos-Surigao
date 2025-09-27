-- Fix My Barangay - Simple Storage Setup (No Policy Creation)
-- This script sets up just the bucket without complex policies

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

-- Success message
SELECT 'Storage bucket created successfully! Go to Storage tab in Supabase to verify.' as message;

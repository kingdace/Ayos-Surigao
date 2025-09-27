# Supabase Storage Setup for Fix My Barangay

## Quick Setup Instructions

### Step 1: Run the Storage Setup SQL

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Paste and execute the contents of `setup-storage.sql`

### Step 2: Verify Storage Bucket

1. Go to **Storage** in your Supabase Dashboard
2. You should see a bucket named `report-images`
3. Verify the bucket is **Public** (for viewing images)

### Step 3: Test Image Upload

1. Try creating a report with images in your app
2. Check the Storage bucket - you should see images uploaded under `reports/[user-id]/`

## Bucket Configuration Details

- **Bucket Name:** `report-images`
- **Public Access:** Yes (for viewing images in reports)
- **File Size Limit:** 5MB per image
- **Allowed Types:** JPEG, PNG, WebP, GIF
- **Organization:** `reports/[user-id]/[filename]`

## Storage Policies

The setup script creates these policies:

- ✅ **Anyone can view** report images (public access)
- ✅ **Authenticated users can upload** images
- ✅ **Users can update/delete** their own images

## Database Integration

The setup includes:

- ✅ `photo_urls` column for multiple images
- ✅ `photo_url` column for backward compatibility
- ✅ Enhanced view with photo counts
- ✅ Proper indexing for performance

## Troubleshooting

### If you get "Bucket not found" error:

1. Make sure you ran the `setup-storage.sql` script
2. Check that the bucket exists in Storage dashboard
3. Verify the bucket name is exactly `report-images`

### If uploads fail:

1. Check the Storage policies are applied
2. Verify user authentication is working
3. Check file size limits (5MB max)

### If images don't display:

1. Ensure bucket is set to **Public**
2. Check the public URL generation
3. Verify CORS settings if needed

## Manual Bucket Creation (Alternative)

If the SQL script doesn't work, create manually:

1. Go to **Storage** → **Create Bucket**
2. Name: `report-images`
3. Check **Public bucket**
4. Set file size limit: 5242880 bytes (5MB)
5. Add policies from the SQL script

## File Organization

Images are stored in this structure:

```
report-images/
  └── reports/
      ├── [user-id-1]/
      │   ├── report_image_1234567890_abc123.jpg
      │   └── report_image_1234567891_def456.jpg
      └── [user-id-2]/
          └── report_image_1234567892_ghi789.jpg
```

This keeps images organized by user and makes it easy to manage permissions and cleanup.

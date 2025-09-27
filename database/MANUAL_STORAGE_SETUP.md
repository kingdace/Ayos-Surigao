# Manual Supabase Storage Setup Guide

Since you're getting permission errors with the SQL script, follow this manual setup process:

## Step 1: Run the Simple SQL Script

1. Go to **Supabase Dashboard → SQL Editor**
2. Paste and run the contents of `simple-storage-setup.sql`
3. This creates the bucket and database columns

## Step 2: Manual Bucket Setup (Alternative)

If the SQL doesn't work, create the bucket manually:

1. Go to **Storage** tab in Supabase Dashboard
2. Click **"Create Bucket"**
3. Fill in these details:
   - **Bucket Name:** `report-images`
   - **Public Bucket:** ✅ **Check this box** (Very Important!)
   - **File Size Limit:** `5242880` (5MB)
   - **Allowed MIME Types:** `image/jpeg,image/png,image/webp,image/gif`

## Step 3: Set Storage Policies (Through Dashboard)

1. In the **Storage** tab, click on the `report-images` bucket
2. Go to **"Policies"** tab
3. Add these policies:

### Policy 1: Public Read Access

- **Policy Name:** `Public read access`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **Policy definition:** Leave empty (allows all)

### Policy 2: Authenticated Upload

- **Policy Name:** `Authenticated users can upload`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **Policy definition:** Leave empty (allows all authenticated users)

## Step 4: Test Upload

1. Go back to your app
2. Try creating a report with images
3. Check the Storage bucket - you should see uploaded files

## Alternative: Simplified Image Handling

If storage setup is still problematic, I can modify the app to store images locally for now and add cloud storage later. Let me know if you want this approach!

## Troubleshooting

### If bucket creation fails:

- Make sure you're the owner of the Supabase project
- Try creating through the dashboard instead of SQL

### If uploads still fail:

- Ensure the bucket is marked as **Public**
- Check that policies allow uploads from authenticated users
- Verify the bucket name is exactly `report-images`

### If images don't display:

- Bucket must be **Public** for images to be viewable
- Check the generated URLs in the database

## Quick Verification

After setup, you should see:

- ✅ `report-images` bucket in Storage tab
- ✅ Bucket marked as "Public"
- ✅ Upload policies enabled
- ✅ Test upload works from your app

The manual setup is actually more reliable than SQL policies, so don't worry about the error!

# Storage Bucket Setup Guide

## Current Bucket Configuration

You have the following buckets:
- ✅ **boqs** - Already created (for BOQ uploads)
- ✅ **products** - Already created  
- ✅ **credit-documents** - Already created
- ⚠️ **documents** - Need to create this

---

## What You Need to Create

You only need to create the **documents** bucket for qualification documents and other uploads.

---

## Manual Setup via Supabase Dashboard

### Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Name**: `documents`
   - **Public**: OFF (unchecked)
   - **File size limit**: 50 MB (52428800 bytes)
   - **Allowed MIME types**: 
     - `application/pdf`
     - `application/vnd.ms-excel`
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `text/csv`
     - `image/png`
     - `image/jpeg`
     - `image/jpg`

### Step 2: Set Storage Policies

After creating the bucket, go to **Policies** tab and add these policies:

#### 1. Upload Policy
```sql
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
```

#### 2. Read Policy
```sql
CREATE POLICY "Users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

#### 3. Update Policy
```sql
CREATE POLICY "Users can update their documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');
```

#### 4. Delete Policy
```sql
CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
```

---

## Verification

After setup, test by:
1. Go to any deal detail page as a reseller
2. Click "Upload BOQ" button
3. Select a CSV, Excel, or PDF file
4. Upload should complete successfully

---

## Files that Use Storage

1. **BOQ Uploads**: `/app/reseller/deals/[id]/page.tsx`
   - Uploads to: `documents/boqs/`
   
2. **Qualification Documents**: `/app/onboarding/qualification/page.tsx`
   - Uploads to: `documents/qualifications/`

---

## Notification API Fix

The notification API error has been fixed to gracefully handle missing email configuration. Notifications will still be saved to the database even if email sending fails.

If you want to enable email notifications, configure your email service credentials in the environment variables.

# Pozhi Database Deployment Guide

## 🎯 Overview

This guide walks you through deploying the Pozhi Photography Studio database schema to Supabase.

---

## 📋 Prerequisites

- Supabase project created
- Supabase credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`)
- PostgreSQL client (psql) or Supabase Dashboard access

---

## 🚀 Deployment Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Navigate to SQL Editor**
   - Open your Supabase project
   - Go to **SQL Editor** in the sidebar

2. **Run the Schema**
   - Click "New Query"
   - Copy the entire contents of `backend/pozhi_schema.sql`
   - Paste into the editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

3. **Verify Tables Created**
   ```sql
   -- Run this query to check tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

   You should see:
   - `album_capacities`
   - `audit_logs`
   - `frame_materials`
   - `frame_sizes`
   - `order_items`
   - `orders`
   - `passphoto_categories`
   - `passphoto_packs`
   - `photocopies_set`
   - `photocopies_single`
   - `profiles`
   - `settings`
   - `snapnprint_categories`
   - `snapnprint_packages`
   - `storage_metrics`
   - `user_uploads`

4. **Verify Seed Data**
   ```sql
   -- Check pricing data inserted
   SELECT COUNT(*) FROM passphoto_packs;  -- Should return 10
   SELECT COUNT(*) FROM frame_sizes;      -- Should return 7
   SELECT COUNT(*) FROM album_capacities; -- Should return 4
   ```

### Option 2: Using psql Command Line

```bash
# Connect to Supabase
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the schema file
\i backend/pozhi_schema.sql

# Exit
\q
```

---

## 🔐 Required Supabase Storage Buckets

The schema expects a Supabase Storage bucket for file uploads:

1. **Go to Storage** in Supabase Dashboard
2. **Create New Bucket**
   - Name: `uploads`
   - Public: `Yes` (for public image access)
   - File size limit: `100MB`
   - Allowed MIME types: `image/*`

3. **Set Bucket Policies** (RLS)
   ```sql
   -- Allow authenticated users to upload to their own folder
   CREATE POLICY "Users can upload to own folder"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'uploads' AND 
     (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Allow public read access
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'uploads');

   -- Allow users to delete their own files
   CREATE POLICY "Users can delete own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'uploads' AND 
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

---

## ☁️ Cloudflare R2 Setup (Optional but Recommended)

For files ≥20MB or multiple files, you'll need Cloudflare R2:

1. **Create R2 Bucket**
   - Go to Cloudflare Dashboard → R2
   - Create a new bucket (e.g., `pozhi-uploads`)

2. **Get API Credentials**
   - Click "Manage R2 API Tokens"
   - Generate new token with:
     - Permissions: `Read & Write`
     - Bucket: Your created bucket

3. **Add to Environment Variables**
   ```env
   CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
   CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
   CLOUDFLARE_R2_BUCKET_NAME=pozhi-uploads
   CLOUDFLARE_R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
   CLOUDFLARE_R2_PUBLIC_URL=https://uploads.yoursite.com
   ```

4. **Install AWS SDK** (for R2 S3-compatible API)
   ```bash
   cd backend
   npm install @aws-sdk/client-s3
   ```

---

## 🧪 Testing the Deployment

### 1. Test Pricing Endpoints

```bash
# Test PassPhoto pricing
curl http://localhost:3000/api/v1/pricing/passphoto

# Expected Response:
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "passport",
        "label": "Passport Size",
        "packs": [...]
      }
    ]
  }
}
```

### 2. Test Database Connection

Create a simple test script `backend/test-db.ts`:

```typescript
import { supabase } from './src/config/supabase';

async function testDatabase() {
  // Test pricing table
  const { data, error } = await supabase
    .from('passphoto_packs')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Database connection failed:', error);
  } else {
    console.log('✅ Database connected successfully!');
    console.log('Sample data:', data);
  }
}

testDatabase();
```

Run with:
```bash
npx ts-node backend/test-db.ts
```

---

## 🔄 Database Migrations (Future Updates)

For future schema changes, create migration files:

```bash
backend/migrations/
  001_initial_schema.sql        (current pozhi_schema.sql)
  002_add_reviews_table.sql     (future changes)
  003_add_discounts.sql          (future changes)
```

---

## 🛠️ Troubleshooting

### Error: "syntax error at or near..."
- Check PostgreSQL version (Supabase uses 15+)
- Ensure entire schema is copied correctly
- Run in separate chunks if needed

### Error: "relation already exists"
- Schema may have been partially applied
- Drop and recreate: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
- Re-run the full schema

### RLS Policies Not Working
- Verify auth is enabled: Check Supabase → Authentication
- Test with actual authenticated user token
- Check policy conditions match your use case

### Seed Data Missing
- Query individual tables to find which failed
- Re-run INSERT statements for missing data
- Check for foreign key constraint errors

---

## 📝 Environment Variables Checklist

Make sure these are set in `backend/.env`:

```env
# Supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Cloudflare R2 (Optional)
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_PUBLIC_URL=

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

---

## ✅ Deployment Checklist

- [ ] Database schema deployed to Supabase
- [ ] All tables created successfully
- [ ] Seed data inserted (verify counts)
- [ ] Supabase `uploads` bucket created
- [ ] Storage RLS policies applied
- [ ] Cloudflare R2 configured (if using)
- [ ] Environment variables set in backend
- [ ] Backend server starts without errors
- [ ] Pricing API endpoints return data
- [ ] Upload endpoint ready (test with small file)

---

## 🎉 Next Steps

Once database is deployed:

1. **Test Backend APIs**
   ```bash
   cd backend
   npm run dev
   ```

2. **Update Frontend** to use API
   - Already created: `frontend/src/services/api.ts`
   - Update pages to fetch pricing from API
   - Test uploads with smart storage

3. **Run End-to-End Tests**
   - Create order flow
   - Upload images
   - Check database records

---

## 📞 Support

If you encounter issues:
- Check Supabase logs: Dashboard → Logs
- Check backend console for errors
- Verify all environment variables are correct
- Test database connection separately

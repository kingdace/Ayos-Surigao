# 🔄 Safe Migration to Centralized Operations Center

## 🎯 **Current vs New Schema Comparison**

### **What You Currently Have:**

- ✅ `profiles` table (simplified)
- ✅ `barangays` table
- ✅ Basic `reports` table (if exists)
- ✅ Simple user roles: `resident`, `barangay_admin`, `guest`

### **What the New Centralized Schema Adds:**

- 🆕 **Enhanced user roles** with operations center staff
- 🆕 **Comprehensive reports workflow** (8 stages)
- 🆕 **Operations staff management** tables
- 🆕 **Report attachments** and **status history**
- 🆕 **Notification system** and **analytics**

---

## 🛡️ **SAFE MIGRATION OPTIONS**

### **Option A: Fresh Start (Recommended for Development)**

**✅ Use this if:**

- You're still in development phase
- No important user data exists yet
- Want a clean, optimized database

**Steps:**

1. **Backup current data** (if any important data exists)
2. **Run the new schema** to replace everything
3. **Test the new features**

### **Option B: Incremental Migration (For Production)**

**✅ Use this if:**

- You have existing user data
- App is already in use
- Need to preserve existing data

**Steps:**

1. **Keep existing tables**
2. **Add new tables** alongside existing ones
3. **Migrate data gradually**

---

## 🚀 **Option A: Fresh Start Implementation**

### **Step 1: Backup Existing Data (Optional)**

If you want to save any existing data:

```sql
-- Go to Supabase Dashboard → SQL Editor
-- Run this to export current data:

SELECT 'Current profiles:' as info;
SELECT * FROM profiles;

SELECT 'Current barangays:' as info;
SELECT * FROM barangays;

-- Copy the output to save your data
```

### **Step 2: Run the New Centralized Schema**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Create a new query**
3. **Copy and paste** the ENTIRE content from `database/centralized-schema.sql`
4. **Click "Run"** - this will:
   - Drop existing tables safely
   - Create all new tables with enhanced structure
   - Set up the complete operations center system

### **Step 3: Verify the Setup**

After running the schema, check that these tables exist:

**Core Tables:**

- ✅ `profiles` (enhanced with admin fields)
- ✅ `operations_staff` (new)
- ✅ `reports` (comprehensive)
- ✅ `report_attachments` (new)
- ✅ `report_status_history` (new)
- ✅ `report_comments` (enhanced)
- ✅ `barangay_officials` (new)
- ✅ `system_notifications` (new)

**Functions & Views:**

- ✅ `reports_with_details` view
- ✅ `generate_report_number()` function
- ✅ `calculate_priority_score()` function

---

## 🚀 **Option B: Incremental Migration**

### **Step 1: Add New Tables Only**

If you want to keep existing data, run this **modified schema** instead:

```sql
-- Modified version that ADDS to existing schema
-- This preserves your current profiles and barangays tables

-- Add new enhanced user roles (extends existing)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operations_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'system_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'field_coordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'data_analyst';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Add new columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coordinator_zone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create new operations center tables (rest of centralized-schema.sql)
-- ... (add all the new tables without dropping existing ones)
```

### **Step 2: Data Migration Scripts**

```sql
-- Migrate existing data to new structure
-- Update existing users with new fields
UPDATE profiles SET is_active = TRUE WHERE is_active IS NULL;

-- Set your account as super admin
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

---

## 💡 **Recommendation: Go with Option A (Fresh Start)**

For your development stage, I recommend **Option A** because:

1. **Cleaner Database**: No legacy fields or conflicts
2. **Better Performance**: Optimized indexes and structure
3. **Complete Feature Set**: All centralized operations features work immediately
4. **Easier Testing**: Fresh start with clean data for testing

**You can always preserve any test data by copying it before migration.**

---

## 🧪 **Testing After Migration**

### **Step 1: Test Basic Functionality**

```bash
# Start your app
npm start

# Test:
# 1. User registration still works
# 2. Login functionality
# 3. Navigation between screens
```

### **Step 2: Test New Report Creation**

```bash
# Test the enhanced report creation:
# 1. Navigate to Create Report (➕ button)
# 2. Try different categories
# 3. Submit a test report
# 4. Check in Supabase dashboard that data is saved
```

### **Step 3: Verify Database Structure**

```sql
-- In Supabase SQL Editor, run:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show all the new tables
```

---

## 🚨 **Rollback Plan (If Needed)**

If something goes wrong, you can always:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run your previous schema** (`database/simple-schema.sql`)
3. **Restore any backed-up data**

---

## ✅ **Which Option Should You Choose?**

**Choose Option A (Fresh Start) if:**

- ✅ You're in development phase
- ✅ No critical user data exists yet
- ✅ You want all centralized features immediately

**Choose Option B (Incremental) if:**

- ✅ You have important existing data
- ✅ App is already being used by real users
- ✅ You need a gradual transition

**Ready to proceed? I recommend Option A for the best experience with the new centralized operations center!** 🚀

# 🛡️ Admin Panel Setup Guide

This guide provides step-by-step instructions to set up the Admin Panel for the Ayos Surigao Operations Center.

## 📋 **Prerequisites**

- Supabase project with existing database
- Admin panel database schema applied
- Admin seeder data applied

## 🗄️ **Database Setup**

### **Step 1: Apply Admin Schema**

1. **Open Supabase Dashboard** → Go to your project
2. **Navigate to SQL Editor** (in the left sidebar)
3. **Run the Admin Schema Script:**

```sql
-- Copy and paste the entire content of database/admin-schema.sql
-- This creates all necessary tables for the admin system
-- The script now uses IF NOT EXISTS to avoid conflicts
```

### **Step 2: Apply Admin Seeder Data**

1. **In the same SQL Editor**
2. **Run the Admin Seeder Script:**

```sql
-- Copy and paste the entire content of database/admin-seeder.sql
-- This creates default admin accounts
-- The script now uses ON CONFLICT DO NOTHING to avoid duplicates
```

### **Step 3: Verify Setup**

1. **Run the Test Script:**

```sql
-- Copy and paste the entire content of database/test-admin-setup.sql
-- This will verify all tables, accounts, and policies were created correctly
```

2. **Or run individual verification queries:**

```sql
-- Check admin accounts
SELECT email, first_name, last_name, role, is_active
FROM admin_accounts
ORDER BY created_at;

-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%admin%' OR table_name LIKE '%assignment%';
```

## 🔐 **Default Admin Credentials**

### **Super Admin Account:**

- **Email:** `admin@ayossurigao.com`
- **Password:** `Admin123!`
- **Role:** Super Admin (full access)

### **Operations Manager:**

- **Email:** `ops@ayossurigao.com`
- **Password:** `Ops123!`
- **Role:** Operations Manager

### **Barangay Admins:**

- **Email:** `barangay001@ayossurigao.com`
- **Password:** `Barangay123!`
- **Role:** Barangay Admin (Barangay 001)

## 🚀 **Testing the Admin Panel**

### **Step 1: Start the Development Server**

```bash
npx expo start -c
```

### **Step 2: Access Admin Panel**

1. **Open the app** on your device/simulator
2. **Look for the "Switch to Admin" button** in the top-right corner (development mode only)
3. **Tap the button** to switch to Admin Panel mode
4. **You should see the Admin Login screen**

### **Step 3: Login as Super Admin**

1. **Enter credentials:**
   - Email: `admin@ayossurigao.com`
   - Password: `Admin123!`
2. **Tap "Sign In"**
3. **You should see the Admin Dashboard**

## 📱 **Admin Panel Features**

### **Dashboard Screen:**

- ✅ **Welcome message** with admin name and role
- ✅ **Quick statistics** (total reports, pending, in progress, resolved)
- ✅ **Critical reports alert** (if any critical reports exist)
- ✅ **Quick action buttons** (Manage Reports, View Map)
- ✅ **Recent reports list** with status and priority indicators

### **Navigation:**

- ✅ **Bottom navigation** with Dashboard, Reports, Map, Profile
- ✅ **Professional UI** with admin-specific styling
- ✅ **Role-based access** (Super Admin has full access)

### **Placeholder Screens:**

- 📋 **Reports Management** (coming soon)
- 🗺️ **Interactive Map** (coming soon)
- 👤 **Admin Profile** (coming soon)

## 🔧 **Development Features**

### **Mode Switching:**

- **Development Mode:** Toggle between Public App and Admin Panel
- **Production Mode:** Admin Panel accessible via separate entry point

### **Authentication:**

- **JWT-based** admin authentication
- **Role-based** access control
- **Session management** with automatic logout

### **Data Integration:**

- **Real-time statistics** from existing reports
- **Admin-specific** data filtering
- **Secure API endpoints** for admin operations

## 🛡️ **Security Features**

### **Database Security:**

- ✅ **Row Level Security (RLS)** enabled on all admin tables
- ✅ **Role-based policies** for data access
- ✅ **Audit trail** for all admin actions
- ✅ **Secure password hashing** (bcrypt)

### **API Security:**

- ✅ **Admin-only endpoints** with authentication
- ✅ **Input validation** and sanitization
- ✅ **Error handling** without data exposure

## 📊 **Admin Roles & Permissions**

### **Super Admin:**

- ✅ **Full system access**
- ✅ **Create/delete admin accounts**
- ✅ **Manage system settings**
- ✅ **All report management**
- ✅ **View all data and analytics**

### **Operations Manager:**

- ✅ **Manage all reports**
- ✅ **Assign reports to coordinators**
- ✅ **Update system status**
- ✅ **View analytics**

### **Barangay Admin:**

- ✅ **Manage reports in their barangay only**
- ✅ **Update report status**
- ✅ **Add comments/notes**

### **Field Coordinator:**

- ✅ **View assigned reports**
- ✅ **Update report status**
- ✅ **Add field notes**

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. "Invalid admin credentials" error:**

- Verify admin accounts exist in database
- Check email spelling
- Ensure account is active (`is_active = true`)

**2. "Unable to resolve module" errors:**

- Restart Metro bundler: `npx expo start -c`
- Clear cache if needed

**3. Database connection issues:**

- Verify Supabase credentials in `.env` file
- Check if admin schema was applied correctly

**4. RLS policy errors:**

- Ensure admin is properly authenticated
- Check if admin account exists and is active

### **Debug Steps:**

1. **Check admin accounts:**

```sql
SELECT * FROM admin_accounts WHERE email = 'admin@ayossurigao.com';
```

2. **Verify RLS policies:**

```sql
SELECT * FROM pg_policies WHERE tablename = 'admin_accounts';
```

3. **Check authentication:**

- Look for authentication errors in console
- Verify Supabase connection

## 📈 **Next Steps**

### **Phase 2: Reports Management**

- Advanced filtering and search
- Bulk actions (approve, reject, assign)
- Status update workflow
- Admin comments system

### **Phase 3: Interactive Map**

- All reports displayed as markers
- Filter by status, category, barangay
- Click markers for report details
- Heat map for problem areas

### **Phase 4: Advanced Features**

- Report assignment system
- Notification system
- Analytics and reporting
- User management

## ✅ **Verification Checklist**

- [ ] Admin schema applied successfully
- [ ] Admin seeder data applied successfully
- [ ] Admin login screen accessible
- [ ] Can login with super admin credentials
- [ ] Admin dashboard displays correctly
- [ ] Statistics load properly
- [ ] Navigation works between screens
- [ ] No console errors
- [ ] Public app still works normally

## 🎉 **Success!**

Your Admin Panel is now set up and ready for use! The Super Admin can now:

- ✅ **Access the admin dashboard**
- ✅ **View real-time statistics**
- ✅ **Monitor recent reports**
- ✅ **Navigate between admin screens**
- ✅ **Switch back to public app**

**The admin panel is fully integrated with your existing system and won't affect any public app functionality!** 🛡️✨

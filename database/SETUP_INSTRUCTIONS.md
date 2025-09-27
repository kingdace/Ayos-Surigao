# Database Setup Instructions

## Option 1: Automatic Setup (Recommended)
The setup script has been run and should have created most of the database structure.

## Option 2: Manual Setup (If needed)

If some tables are missing or you want to ensure everything is set up correctly:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `fbnvzwinwapnjicvsvqu`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Schema**
   - Copy the entire content from `database/schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Verify Tables Created**
   Go to "Table Editor" and verify these tables exist:
   - `profiles`
   - `reports`
   - `report_comments`
   - `report_votes`

## What the Database Includes

### Tables:
- **profiles**: User information (extends auth.users)
- **reports**: Barangay issue reports with location, photos, status
- **report_comments**: Comments and updates on reports
- **report_votes**: Community voting/likes for reports

### Features:
- **Row Level Security (RLS)**: Secure access policies
- **Enums**: Predefined categories, statuses, and priorities
- **Indexes**: Optimized for performance
- **Triggers**: Auto-create profiles, update timestamps
- **Views**: reports_with_details for enhanced data

### Categories Available:
- 💡 Broken Lights
- 🗑️ Trash Collection
- 💧 Water Issues
- 🛣️ Road Damage
- 🌊 Drainage
- 🚨 Public Safety
- 🔊 Noise Complaint
- 📝 Other

## Testing the Setup

You can test if everything is working by running:
```bash
node scripts/setup-database.js
```

This will verify the connection and show you what was created.

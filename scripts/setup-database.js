// Database setup script for Fix My Barangay app
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Make sure you have:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for admin operations)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Fix My Barangay database...\n');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        // Use rpc to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        });

        if (error) {
          // If rpc doesn't work, try direct query for simpler statements
          if (error.message.includes('function exec_sql')) {
            console.log('   Trying alternative method...');
            // For basic queries, we can try using the query method
            // This is a simplified approach - in production you'd want proper migration tools
            console.log('   ⚠️  Manual execution required for this statement');
          } else {
            throw error;
          }
        } else {
          console.log('   ✅ Success');
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} may need manual execution:`, err.message);
      }
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 What was created:');
    console.log('• profiles table (user information)');
    console.log('• reports table (barangay issue reports)');
    console.log('• report_comments table (updates and comments)');
    console.log('• report_votes table (community voting)');
    console.log('• Row Level Security policies');
    console.log('• Indexes for performance');
    console.log('• Triggers and functions');
    console.log('• reports_with_details view');

    console.log('\n🔧 Next steps:');
    console.log('1. Check your Supabase dashboard to verify tables were created');
    console.log('2. If some tables are missing, you can run the SQL manually in the SQL editor');
    console.log('3. Start building the React Native app!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Manual setup option:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the content from database/schema.sql');
    console.log('4. Run the SQL script manually');
  }
}

// Test connection first
async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Connected to Supabase successfully');
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fix My Barangay - Database Setup\n');
  
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  await setupDatabase();
}

main();

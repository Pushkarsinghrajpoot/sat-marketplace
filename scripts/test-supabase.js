// Test Supabase Connection
// Run with: node scripts/test-supabase.js

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 Checking Supabase Configuration...\n');

console.log('1. Environment Variables:');
console.log('   SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('   SUPABASE_KEY:', supabaseKey ? '✓ Set' : '✗ Missing');
console.log('   URL Value:', supabaseUrl || 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing environment variables in .env.local');
  console.log('Make sure your .env.local has:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
  process.exit(1);
}

// Test connection
async function testConnection() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n2. Testing Supabase Connection...');
    
    // Test database connection by querying organizations table
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database Error:', error.message);
      console.log('\nPossible issues:');
      console.log('- Migrations not run (tables don\'t exist)');
      console.log('- Wrong Supabase URL');
      console.log('- Wrong API key');
      console.log('\nGo to Supabase Dashboard → SQL Editor and run migrations.');
      return false;
    }
    
    console.log('✓ Database connection successful!');
    
    // Check if users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, role')
      .limit(5);
    
    if (usersError) {
      console.log('\n❌ Users table error:', usersError.message);
      return false;
    }
    
    console.log('\n3. Users in database:');
    if (users && users.length > 0) {
      users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    } else {
      console.log('   ⚠️  No users found. Run seed_data.sql in Supabase.');
    }
    
    // Test auth
    console.log('\n4. Testing Auth Configuration...');
    const { data: session } = await supabase.auth.getSession();
    console.log('✓ Auth system accessible');
    
    return true;
  } catch (err) {
    console.log('\n❌ Error:', err.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n✅ All checks passed! Supabase is configured correctly.');
    console.log('If login still fails, check:');
    console.log('- Email auth is enabled in Supabase Dashboard → Authentication → Providers');
    console.log('- User exists in both auth.users AND users table');
  } else {
    console.log('\n❌ Configuration issues found. Fix them and try again.');
  }
});

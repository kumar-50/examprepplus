const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');
    
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subscription_plans', 'subscriptions')
      ORDER BY table_name;
    `;
    
    console.log('Found tables:');
    result.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    if (result.length === 0) {
      console.log('  ❌ No subscription tables found!');
      console.log('\n💡 You need to run migrations first.');
    }
    
    // Check if subscription_plans has data
    if (result.some(r => r.table_name === 'subscription_plans')) {
      const count = await sql`SELECT COUNT(*) FROM subscription_plans`;
      console.log(`\n📊 subscription_plans has ${count[0].count} rows`);
    }
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();

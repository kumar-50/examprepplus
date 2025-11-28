const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function testQuery() {
  try {
    console.log('🧪 Testing subscription plans query...\n');
    
    const plans = await sql`
      SELECT * FROM subscription_plans 
      WHERE is_active = true 
      ORDER BY display_order
    `;
    
    console.log(`✅ Found ${plans.length} plans:`);
    plans.forEach(plan => {
      console.log(`  • ${plan.name} - ₹${plan.price/100} (Order: ${plan.display_order})`);
    });
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testQuery();

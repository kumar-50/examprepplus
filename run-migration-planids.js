require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  try {
    // Check if column exists
    const existingCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'promo_codes' 
      AND column_name = 'applicable_plan_ids'
    `;
    
    if (existingCols.length === 0) {
      await sql`ALTER TABLE promo_codes ADD COLUMN applicable_plan_ids jsonb`;
      console.log('✅ Added applicable_plan_ids column');
    } else {
      console.log('⏭️  applicable_plan_ids column already exists');
    }
    
    console.log('\n🎉 Migration complete!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await sql.end();
  }
}

migrate();

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  try {
    // Check if columns exist first
    const existingCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'promo_codes' 
      AND column_name IN ('is_global', 'applied_by')
    `;
    
    const existingColNames = existingCols.map(c => c.column_name);
    
    if (!existingColNames.includes('is_global')) {
      await sql`ALTER TABLE promo_codes ADD COLUMN is_global boolean DEFAULT false NOT NULL`;
      console.log('✅ Added is_global column');
    } else {
      console.log('⏭️  is_global column already exists');
    }
    
    if (!existingColNames.includes('applied_by')) {
      await sql`ALTER TABLE promo_codes ADD COLUMN applied_by varchar(10) DEFAULT 'user' NOT NULL`;
      console.log('✅ Added applied_by column');
    } else {
      console.log('⏭️  applied_by column already exists');
    }
    
    console.log('\n🎉 Migration complete!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await sql.end();
  }
}

migrate();

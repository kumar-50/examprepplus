const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    console.log('🔧 Fixing goal_type enum...\n');
    
    // Drop the empty enum and recreate with values
    await sql.unsafe(`
      DROP TYPE IF EXISTS goal_type CASCADE;
      CREATE TYPE goal_type AS ENUM('daily', 'weekly', 'monthly');
    `);
    
    console.log('✅ Dropped and recreated goal_type enum with values: daily, weekly, monthly');
    
    // Recreate the user_goals table column with the enum
    await sql.unsafe(`
      ALTER TABLE user_goals 
      ALTER COLUMN goal_type TYPE goal_type USING goal_type::text::goal_type;
    `);
    
    console.log('✅ Updated user_goals table to use new enum');
    console.log('\n✨ Migration complete!\n');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
})();

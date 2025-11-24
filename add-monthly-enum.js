const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    // Add 'monthly' to enum
    await sql.unsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_enum 
              WHERE enumlabel = 'monthly' 
              AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'goal_type')
          ) THEN
              ALTER TYPE goal_type ADD VALUE 'monthly';
          END IF;
      END $$;
    `);
    
    console.log('✅ Successfully added "monthly" to goal_type enum');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
})();

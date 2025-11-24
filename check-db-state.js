const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'user_goals'
    `;
    
    console.log('user_goals table exists:', result.length > 0);
    
    if (result.length === 0) {
      console.log('\n⚠️  user_goals table does not exist!');
      console.log('Run the base migrations first: npm run db:push or apply drizzle/0008_windy_master_mold.sql');
    } else {
      // Check enum
      const enumCheck = await sql`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'goal_type')
      `;
      
      console.log('\nCurrent goal_type enum values:', enumCheck.map(e => e.enumlabel));
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error.message);
    await sql.end();
    process.exit(1);
  }
})();

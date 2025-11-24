/**
 * Script to update goal_type enum to include 'monthly'
 */
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const updateGoalTypeEnum = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

  console.log('🔧 Updating goal_type enum...\n');

  try {
    // Add 'monthly' to the enum
    await sql.unsafe(`
      ALTER TYPE goal_type ADD VALUE IF NOT EXISTS 'monthly';
    `);
    
    console.log('✅ Successfully added "monthly" to goal_type enum');
    
    // Update any existing 'custom' values to 'monthly'
    const result = await sql`
      UPDATE user_goals 
      SET goal_type = 'monthly' 
      WHERE goal_type = 'custom'
      RETURNING id
    `;
    
    console.log(`✅ Updated ${result.length} existing 'custom' goals to 'monthly'`);
    console.log('\n✨ Migration complete!\n');
    
  } catch (error) {
    console.error('❌ Error updating enum:', error);
    throw error;
  } finally {
    await sql.end();
  }
};

updateGoalTypeEnum();

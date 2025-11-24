/**
 * Create Sample Goal for Testing
 */

const postgres = require('postgres');

async function createSampleGoal() {
  console.log('🎯 Creating sample daily goal...\n');

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    // Get first user
    const users = await sql`SELECT id, email FROM users LIMIT 1`;
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create an account first.');
      return;
    }

    const user = users[0];
    console.log(`👤 User: ${user.email}`);

    // Create today's goal
    const today = new Date().toISOString().split('T')[0];
    
    const [goal] = await sql`
      INSERT INTO user_goals (
        user_id, 
        goal_type, 
        goal_category, 
        target_value, 
        current_value,
        period_start, 
        period_end,
        status
      ) VALUES (
        ${user.id},
        'daily',
        'questions',
        20,
        0,
        ${today},
        ${today},
        'active'
      )
      RETURNING *
    `;

    console.log('✅ Sample goal created:');
    console.log(`   Type: ${goal.goal_type}`);
    console.log(`   Category: ${goal.goal_category}`);
    console.log(`   Target: ${goal.target_value} questions`);
    console.log(`   Current: ${goal.current_value}`);
    console.log(`   Date: ${goal.period_start}`);
    
    console.log('\n🎉 Goal will appear on your progress dashboard!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

createSampleGoal();

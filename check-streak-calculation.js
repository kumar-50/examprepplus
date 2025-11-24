const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    console.log('🔍 Checking streak calculation...\n');
    
    // Get user ID
    const users = await sql`
      SELECT id, email FROM users LIMIT 1
    `;
    
    if (users.length === 0) {
      console.log('User not found');
      await sql.end();
      return;
    }
    
    const userId = users[0].id;
    console.log('User:', users[0].email);
    console.log('User ID:', userId);
    console.log('\n📅 Test submission dates:\n');
    
    // Get all test submission dates
    const dates = await sql`
      SELECT 
        DATE(submitted_at) as date,
        COUNT(*) as tests_count
      FROM user_test_attempts
      WHERE user_id = ${userId}
        AND status = 'submitted'
        AND submitted_at IS NOT NULL
      GROUP BY DATE(submitted_at)
      ORDER BY DATE(submitted_at) DESC
    `;
    
    dates.forEach((d, i) => {
      console.log(`${i + 1}. ${d.date} - ${d.tests_count} test(s)`);
    });
    
    console.log('\n📊 Streak calculation:');
    console.log('Total unique days:', dates.length);
    
    // Check if dates are consecutive
    if (dates.length > 0) {
      let streak = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < dates.length - 1; i++) {
        const current = new Date(dates[i].date);
        const next = new Date(dates[i + 1].date);
        const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));
        
        console.log(`\nDay ${i + 1} to ${i + 2}: ${diffDays} day(s) apart`);
        
        if (diffDays === 1) {
          streak++;
          console.log('  ✅ Consecutive! Streak:', streak);
        } else {
          console.log('  ❌ Gap found! Streak broken.');
          break;
        }
      }
      
      console.log('\n🔥 Actual consecutive streak:', streak);
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
    process.exit(1);
  }
})();

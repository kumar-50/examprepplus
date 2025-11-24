const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    console.log('🔍 Fetching actual user test dates from database...\n');
    
    // Get all users with test attempts
    const users = await sql`
      SELECT u.id, u.email, COUNT(DISTINCT DATE(uta.submitted_at)) as days_count
      FROM users u
      LEFT JOIN user_test_attempts uta ON u.id = uta.user_id 
        AND uta.status = 'submitted' 
        AND uta.submitted_at IS NOT NULL
      GROUP BY u.id, u.email
      HAVING COUNT(DISTINCT DATE(uta.submitted_at)) > 0
      ORDER BY days_count DESC
      LIMIT 5
    `;
    
    if (users.length === 0) {
      console.log('No users with test attempts found');
      await sql.end();
      return;
    }
    
    console.log('Users with activity:');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} - ${u.days_count} days`);
    });
    
    const userId = users[0].id;
    console.log(`\n\n📊 Analyzing: ${users[0].email}\n`);
    console.log('='.repeat(60));
    
    // Get ALL test submission dates for this user
    const dates = await sql`
      SELECT 
        DATE(submitted_at) as date,
        COUNT(*) as test_count,
        submitted_at
      FROM user_test_attempts
      WHERE user_id = ${userId}
        AND status = 'submitted'
        AND submitted_at IS NOT NULL
      GROUP BY DATE(submitted_at), submitted_at
      ORDER BY DATE(submitted_at) DESC
    `;
    
    console.log('\n📅 All practice dates (newest first):\n');
    dates.forEach((d, i) => {
      const dateStr = new Date(d.date).toISOString().split('T')[0];
      console.log(`${String(i + 1).padStart(2, ' ')}. ${dateStr} - ${d.test_count} test(s)`);
    });
    
    // Calculate consecutive streaks manually
    console.log('\n\n🔍 Analyzing consecutive patterns:\n');
    
    const uniqueDates = dates.map(d => new Date(d.date).toISOString().split('T')[0]);
    let allStreaks = [];
    let currentStreakLength = 1;
    let streakStart = 0;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive
        currentStreakLength++;
      } else {
        // Gap found - save current streak
        if (currentStreakLength >= 1) {
          allStreaks.push({
            length: currentStreakLength,
            start: uniqueDates[streakStart],
            end: uniqueDates[i],
          });
        }
        currentStreakLength = 1;
        streakStart = i + 1;
      }
    }
    
    // Don't forget the last streak
    if (currentStreakLength >= 1) {
      allStreaks.push({
        length: currentStreakLength,
        start: uniqueDates[streakStart],
        end: uniqueDates[uniqueDates.length - 1],
      });
    }
    
    console.log('All consecutive streaks found:\n');
    allStreaks.forEach((streak, i) => {
      console.log(`${i + 1}. ${streak.length} day(s): ${streak.start} to ${streak.end}`);
    });
    
    const longestStreak = Math.max(...allStreaks.map(s => s.length));
    console.log(`\n🏆 Longest Streak: ${longestStreak} days`);
    
    // Check current streak (from today)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const mostRecent = uniqueDates[0];
    
    console.log(`\n📆 Today: ${today}`);
    console.log(`📆 Most recent practice: ${mostRecent}`);
    
    if (mostRecent === today || mostRecent === yesterday) {
      // Find current streak from first streak in allStreaks
      const currentStreak = allStreaks[0];
      console.log(`\n🔥 Current Streak: ${currentStreak.length} day(s) (ACTIVE)`);
    } else {
      console.log(`\n💔 Current Streak: 0 days (BROKEN - last practice was ${mostRecent})`);
    }
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
  }
})();

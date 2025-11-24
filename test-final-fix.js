const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const { differenceInDays, startOfDay, subDays, isSameDay } = require('date-fns');

function calculateStreak(activityDates) {
  if (!activityDates || activityDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
      streakProtection: false,
    };
  }

  const uniqueDates = Array.from(
    new Set(
      activityDates.map((date) => startOfDay(new Date(date)).getTime())
    )
  )
    .map((time) => new Date(time))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  
  const mostRecentActivity = uniqueDates[0];
  if (!mostRecentActivity) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
      streakProtection: false,
    };
  }
  
  const daysSinceLastActivity = differenceInDays(today, mostRecentActivity);
  console.log('Days since last activity:', daysSinceLastActivity);
  
  if (daysSinceLastActivity > 1) {
    console.log('❌ Streak broken! Last activity was more than 1 day ago');
    
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = uniqueDates[i];
      const nextDate = uniqueDates[i + 1];
      if (!currentDate || !nextDate) continue;
      
      const daysDiff = differenceInDays(currentDate, nextDate);
      
      if (daysDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      currentStreak: 0,
      longestStreak,
      totalActiveDays: uniqueDates.length,
      lastActiveDate: mostRecentActivity,
      streakProtection: false,
    };
  }
  
  let currentStreak = 0;
  let currentDate = today;
  let hasActivityToday = false;
  
  for (const date of uniqueDates) {
    const daysDiff = differenceInDays(currentDate, date);
    
    if (daysDiff === 0) {
      currentStreak++;
      hasActivityToday = isSameDay(date, today);
      currentDate = subDays(currentDate, 1);
    } else if (daysDiff === 1) {
      currentStreak++;
      currentDate = subDays(date, 1);
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDateItem = uniqueDates[i];
    const nextDateItem = uniqueDates[i + 1];
    if (!currentDateItem || !nextDateItem) continue;
    
    const daysDiff = differenceInDays(currentDateItem, nextDateItem);
    
    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  const lastActivity = uniqueDates[0];
  const streakProtection =
    !hasActivityToday &&
    lastActivity !== undefined &&
    isSameDay(lastActivity, yesterday);

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: uniqueDates.length,
    lastActiveDate: lastActivity || null,
    streakProtection,
  };
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    console.log('🧪 Testing FIXED streak calculation\n');
    console.log('Today is:', startOfDay(new Date()).toISOString().split('T')[0]);
    console.log('');
    
    // Simulate the fixed query that returns date strings
    const activityDates = await sql`
      SELECT DATE(submitted_at)::text as date
      FROM user_test_attempts
      WHERE user_id = (SELECT id FROM users WHERE email = 'muthu08812@gmail.com')
        AND status = 'submitted'
        AND submitted_at IS NOT NULL
      GROUP BY DATE(submitted_at)
      ORDER BY DATE(submitted_at) DESC
    `;
    
    console.log('📅 Database dates (as strings):');
    activityDates.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.date} (${typeof d.date})`);
    });
    
    // Parse using the same logic as page.tsx
    const dates = activityDates.map((d) => {
      const dateStr = d.date;
      if (!dateStr) return new Date();
      const parts = dateStr.split('-').map(Number);
      const [year = 0, month = 1, day = 1] = parts;
      return new Date(year, month - 1, day);
    });
    
    console.log('\n✅ Parsed Date objects:');
    dates.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.toISOString().split('T')[0]}`);
    });
    
    console.log('\n🔍 Checking for consecutive sequences:');
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = differenceInDays(dates[i], dates[i + 1]);
      const status = diff === 1 ? '✓ consecutive' : `✗ gap (${diff} days)`;
      console.log(`  ${dates[i].toISOString().split('T')[0]} → ${dates[i + 1].toISOString().split('T')[0]}: ${status}`);
    }
    
    const result = calculateStreak(dates);
    
    console.log('\n📊 FINAL RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Current Streak:', result.currentStreak, 'days');
    console.log('Longest Streak:', result.longestStreak, 'days');
    console.log('Total Active Days:', result.totalActiveDays);
    console.log('Last Active:', result.lastActiveDate?.toISOString().split('T')[0]);
    console.log('Streak Protection:', result.streakProtection);
    
    console.log('\n✅ Expected values:');
    console.log('  Current: 0 (last practice was Nov 22, today is Nov 23)');
    console.log('  Longest: 3 (Nov 10-11-12)');
    console.log('  Total: 9');
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
  }
})();

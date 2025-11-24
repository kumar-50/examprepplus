const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

// Import the actual streak calculator
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
  
  if (daysSinceLastActivity > 1) {
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
    console.log('🔍 Testing streak calculation with ACTUAL DB data...\n');
    
    const users = await sql`
      SELECT id, email FROM users WHERE email = 'muthu08812@gmail.com' LIMIT 1
    `;
    
    if (users.length === 0) {
      console.log('User not found');
      await sql.end();
      return;
    }
    
    const userId = users[0].id;
    console.log('Testing for:', users[0].email);
    console.log('User ID:', userId);
    
    const activityDates = await sql`
      SELECT DATE(submitted_at) as date
      FROM user_test_attempts
      WHERE user_id = ${userId}
        AND status = 'submitted'
        AND submitted_at IS NOT NULL
      GROUP BY DATE(submitted_at)
      ORDER BY DATE(submitted_at) DESC
    `;
    
    console.log('\n📅 Raw dates from DB:');
    activityDates.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.date}`);
    });
    
    // Test OLD parsing (bug)
    console.log('\n❌ OLD PARSING (with timezone bug):');
    const oldDates = activityDates.map((d) => new Date(d.date));
    const oldResult = calculateStreak(oldDates);
    console.log('Current Streak:', oldResult.currentStreak);
    console.log('Longest Streak:', oldResult.longestStreak);
    
    // Test NEW parsing (fixed)
    console.log('\n✅ NEW PARSING (timezone fixed):');
    const newDates = activityDates.map((d) => {
      const dateStr = typeof d.date === 'string' ? d.date : d.date.toISOString().split('T')[0];
      if (!dateStr) return new Date();
      const parts = dateStr.split('-').map(Number);
      const [year = 0, month = 1, day = 1] = parts;
      return new Date(year, month - 1, day);
    });
    
    console.log('Parsed dates:');
    newDates.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.toISOString().split('T')[0]}`);
    });
    
    const newResult = calculateStreak(newDates);
    console.log('\n📊 RESULTS:');
    console.log('Current Streak:', newResult.currentStreak, 'days');
    console.log('Longest Streak:', newResult.longestStreak, 'days');
    console.log('Total Active Days:', newResult.totalActiveDays);
    console.log('Last Active:', newResult.lastActiveDate?.toISOString().split('T')[0]);
    console.log('Streak Protection:', newResult.streakProtection);
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
  }
})();

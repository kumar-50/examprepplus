// Test with REAL user data from database
const { differenceInDays, startOfDay, subDays, isSameDay } = require('date-fns');

function calculateStreakFixed(activityDates) {
  if (!activityDates || activityDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
  }

  const uniqueDates = Array.from(
    new Set(activityDates.map((date) => startOfDay(new Date(date)).getTime()))
  )
    .map((time) => new Date(time))
    .sort((a, b) => b.getTime() - a.getTime());

  console.log('\n📅 Sorted dates (newest first):');
  uniqueDates.forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.toISOString().split('T')[0]}`);
  });

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const mostRecentActivity = uniqueDates[0];
  const daysSinceLastActivity = differenceInDays(today, mostRecentActivity);

  console.log(`\n📆 Today: ${today.toISOString().split('T')[0]}`);
  console.log(`📆 Most recent: ${mostRecentActivity.toISOString().split('T')[0]}`);
  console.log(`⏰ Days since last activity: ${daysSinceLastActivity}`);

  // If last activity is more than 1 day ago, streak is broken
  if (daysSinceLastActivity > 1) {
    console.log('\n❌ CURRENT STREAK BROKEN (no activity in last 2 days)');
    
    // Calculate longest historical streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    console.log('\n🔍 Finding longest streak in history:');
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const daysDiff = differenceInDays(uniqueDates[i], uniqueDates[i + 1]);
      const date1 = uniqueDates[i].toISOString().split('T')[0];
      const date2 = uniqueDates[i + 1].toISOString().split('T')[0];
      
      console.log(`  ${date1} → ${date2}: ${daysDiff} day(s) apart`);
      
      if (daysDiff === 1) {
        tempStreak++;
        console.log(`    ✓ Consecutive! Temp streak = ${tempStreak}`);
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        console.log(`    ✗ Gap! Saving streak of ${tempStreak}, resetting to 1`);
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    console.log(`\n🔥 Current Streak: 0 (broken)`);
    console.log(`🏆 Longest Streak: ${longestStreak}`);
    
    return { currentStreak: 0, longestStreak, totalActiveDays: uniqueDates.length };
  }

  // Calculate current streak
  let currentStreak = 0;
  let currentDate = today;
  let hasActivityToday = false;
  
  console.log('\n✅ CURRENT STREAK ACTIVE (practiced today or yesterday)');
  console.log('\n🔍 Calculating current streak from today backward:');
  
  for (const date of uniqueDates) {
    const daysDiff = differenceInDays(currentDate, date);
    const dateStr = date.toISOString().split('T')[0];
    const currentStr = currentDate.toISOString().split('T')[0];
    
    console.log(`  Checking ${dateStr} vs ${currentStr}: ${daysDiff} day(s) apart`);
    
    if (daysDiff === 0) {
      currentStreak++;
      console.log(`    ✓ Same day! Streak = ${currentStreak}`);
      hasActivityToday = isSameDay(date, today);
      currentDate = subDays(currentDate, 1);
    } else if (daysDiff === 1) {
      currentStreak++;
      console.log(`    ✓ Previous day! Streak = ${currentStreak}`);
      currentDate = subDays(date, 1);
    } else {
      console.log(`    ✗ Gap of ${daysDiff} days! Streak stops.`);
      break;
    }
  }

  // Calculate longest streak (including current)
  let longestStreak = 0;
  let tempStreak = 1;
  
  console.log('\n🔍 Finding longest streak in ALL data:');
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const daysDiff = differenceInDays(uniqueDates[i], uniqueDates[i + 1]);
    const date1 = uniqueDates[i].toISOString().split('T')[0];
    const date2 = uniqueDates[i + 1].toISOString().split('T')[0];
    
    console.log(`  ${date1} → ${date2}: ${daysDiff} day(s) apart`);
    
    if (daysDiff === 1) {
      tempStreak++;
      console.log(`    ✓ Consecutive! Temp streak = ${tempStreak}`);
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      console.log(`    ✗ Gap! Saving streak of ${tempStreak}, resetting to 1`);
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  console.log(`\n🔥 Current Streak: ${currentStreak}`);
  console.log(`🏆 Longest Streak: ${longestStreak}`);

  return { currentStreak, longestStreak, totalActiveDays: uniqueDates.length };
}

// REAL DATA from your database
const realDates = [
  '2025-11-22',
  '2025-11-21',
  '2025-11-19', // Gap
  '2025-11-17', // Gap
  '2025-11-16',
  '2025-11-14', // Gap
  '2025-11-12', // Gap
  '2025-11-11',
  '2025-11-10',
];

console.log('========== TESTING WITH YOUR REAL DATA ==========');
console.log('Dates:', realDates.join(', '));
console.log('\nExpected: Current = 0 (last practice was yesterday), Longest = 3 (Nov 12,11,10)');

const result = calculateStreakFixed(realDates.map(d => new Date(d)));

console.log('\n========== RESULTS ==========');
console.log(`Current Streak: ${result.currentStreak} days`);
console.log(`Longest Streak: ${result.longestStreak} days`);
console.log(`Total Active Days: ${result.totalActiveDays} days`);

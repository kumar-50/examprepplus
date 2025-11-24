// Test the FIXED streak calculation logic
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

  const today = startOfDay(new Date());
  const mostRecentActivity = uniqueDates[0];
  const daysSinceLastActivity = differenceInDays(today, mostRecentActivity);

  console.log('\n📅 Most recent activity:', mostRecentActivity.toISOString().split('T')[0]);
  console.log('📆 Today:', today.toISOString().split('T')[0]);
  console.log('⏰ Days since last activity:', daysSinceLastActivity);

  // If last activity is more than 1 day ago, streak is broken
  if (daysSinceLastActivity > 1) {
    console.log('\n❌ STREAK BROKEN - No activity in last 2 days');
    
    // Calculate longest historical streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const daysDiff = differenceInDays(uniqueDates[i], uniqueDates[i + 1]);
      if (daysDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    console.log('🔥 Current Streak: 0 (broken)');
    console.log('📊 Longest Streak (historical):', longestStreak);
    
    return { currentStreak: 0, longestStreak, totalActiveDays: uniqueDates.length };
  }

  // Calculate current streak
  let currentStreak = 0;
  let currentDate = today;
  
  for (const date of uniqueDates) {
    const daysDiff = differenceInDays(currentDate, date);
    if (daysDiff === 0) {
      currentStreak++;
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
    const daysDiff = differenceInDays(uniqueDates[i], uniqueDates[i + 1]);
    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  console.log('\n✅ STREAK ACTIVE');
  console.log('🔥 Current Streak:', currentStreak);
  console.log('📊 Longest Streak:', longestStreak);

  return { currentStreak, longestStreak, totalActiveDays: uniqueDates.length };
}

// Test 1: Last practice was 5 days ago (should show current = 0)
console.log('\n========== TEST 1: Old Activity (5 days ago) ==========');
const oldDates = [
  '2025-11-18', // 5 days ago
  '2025-11-17',
  '2025-11-16',
  '2025-11-15',
  '2025-11-14',
  '2025-11-13',
  '2025-11-12',
  '2025-11-11',
  '2025-11-10',
];
calculateStreakFixed(oldDates.map(d => new Date(d)));

// Test 2: Practiced today (should show current = 2)
console.log('\n\n========== TEST 2: Practiced Today ==========');
const recentDates = [
  '2025-11-23', // Today
  '2025-11-22', // Yesterday
  '2025-11-20', // Gap
  '2025-11-19',
];
calculateStreakFixed(recentDates.map(d => new Date(d)));

// Test 3: Practiced yesterday (should show current = 3 with protection)
console.log('\n\n========== TEST 3: Practiced Yesterday ==========');
const yesterdayDates = [
  '2025-11-22', // Yesterday
  '2025-11-21',
  '2025-11-20',
];
calculateStreakFixed(yesterdayDates.map(d => new Date(d)));

// Test the streak calculation logic
const { differenceInDays, startOfDay, subDays, isSameDay } = require('date-fns');

function calculateStreak(activityDates) {
  if (!activityDates || activityDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
    };
  }

  // Normalize all dates to start of day and remove duplicates
  const uniqueDates = Array.from(
    new Set(
      activityDates.map((date) => startOfDay(new Date(date)).getTime())
    )
  )
    .map((time) => new Date(time))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)

  console.log('\n📅 Unique activity dates (sorted newest first):');
  uniqueDates.forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.toISOString().split('T')[0]}`);
  });

  const today = startOfDay(new Date());
  console.log('\n📆 Today:', today.toISOString().split('T')[0]);
  
  // Calculate current streak
  let currentStreak = 0;
  let currentDate = today;
  let hasActivityToday = false;
  
  console.log('\n🔄 Calculating current streak:');
  for (const date of uniqueDates) {
    const daysDiff = differenceInDays(currentDate, date);
    console.log(`\n  Checking date: ${date.toISOString().split('T')[0]}`);
    console.log(`  Current date: ${currentDate.toISOString().split('T')[0]}`);
    console.log(`  Days difference: ${daysDiff}`);
    
    if (daysDiff === 0) {
      // Activity on current date
      currentStreak++;
      console.log(`  ✅ Activity on current date! Streak = ${currentStreak}`);
      hasActivityToday = isSameDay(date, today);
      currentDate = subDays(currentDate, 1);
    } else if (daysDiff === 1) {
      // Activity on previous day (streak continues)
      currentStreak++;
      console.log(`  ✅ Activity 1 day before! Streak = ${currentStreak}`);
      currentDate = subDays(date, 1);
    } else {
      // Gap found, streak broken
      console.log(`  ❌ Gap of ${daysDiff} days found! Streak breaks here.`);
      break;
    }
  }

  console.log(`\n🔥 FINAL Current Streak: ${currentStreak} days`);
  console.log(`📊 Total Active Days: ${uniqueDates.length} days`);

  return {
    currentStreak,
    totalActiveDays: uniqueDates.length,
  };
}

// Simulate scattered dates like in the screenshot (9 days total but NOT consecutive)
const testDates = [
  '2025-11-23', // Today
  '2025-11-22', // Yesterday  (2-day streak from here)
  '2025-11-20', // Gap of 1 day
  '2025-11-19',
  '2025-11-17', // Gap
  '2025-11-16',
  '2025-11-15',
  '2025-11-13', // Gap
  '2025-11-11', // Gap
];

console.log('🧪 Testing with scattered dates (like your screenshot):');
console.log('Dates:', testDates.join(', '));

calculateStreak(testDates.map(d => new Date(d)));

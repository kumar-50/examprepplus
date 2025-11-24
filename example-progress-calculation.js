const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function demonstrateProgressFeatures() {
  try {
    console.log('🎯 PROGRESS FEATURES DEMONSTRATION WITH REAL DATA\n');
    console.log('=' .repeat(70));
    
    // Get user
    const user = await sql`
      SELECT id, email FROM users 
      WHERE email = 'muthu08812@gmail.com' 
      LIMIT 1
    `;
    
    if (user.length === 0) {
      console.log('User not found');
      return;
    }
    
    const userId = user[0].id;
    console.log(`\n📧 User: ${user[0].email}`);
    console.log('=' .repeat(70));
    
    // ============================================
    // 1. EXAM READINESS CALCULATION
    // ============================================
    console.log('\n\n1️⃣  EXAM READINESS SCORE\n');
    console.log('-'.repeat(70));
    
    // Get overall stats
    const overallStats = await sql`
      SELECT 
        AVG((correct_answers::float / NULLIF(correct_answers + incorrect_answers + unanswered, 0)) * 100) as avg_accuracy,
        COUNT(*) as tests_completed,
        SUM(correct_answers + incorrect_answers) as questions_answered
      FROM user_test_attempts
      WHERE user_id = ${userId}
        AND status = 'submitted'
    `;
    
    // Get section stats
    const sectionStats = await sql`
      SELECT 
        s.id as section_id,
        s.name as section_name,
        AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0.0 END) as accuracy,
        COUNT(*) as questions_attempted,
        COUNT(DISTINCT DATE(uta.submitted_at)) as days_practiced
      FROM user_answers ua
      LEFT JOIN questions q ON ua.question_id = q.id
      LEFT JOIN sections s ON q.section_id = s.id
      LEFT JOIN user_test_attempts uta ON ua.attempt_id = uta.id
      WHERE uta.user_id = ${userId}
        AND uta.status = 'submitted'
      GROUP BY s.id, s.name
      ORDER BY s.name
    `;
    
    // Get total sections
    const totalSections = await sql`
      SELECT COUNT(*) as count FROM sections
    `;
    
    // Get recent trend
    const recentTests = await sql`
      SELECT 
        (correct_answers::float / NULLIF(correct_answers + incorrect_answers + unanswered, 0)) * 100 as accuracy,
        submitted_at
      FROM user_test_attempts
      WHERE user_id = ${userId}
        AND status = 'submitted'
      ORDER BY submitted_at DESC
      LIMIT 20
    `;
    
    const avgAccuracy = Number(overallStats[0]?.avg_accuracy || 0);
    const testsCompleted = Number(overallStats[0]?.tests_completed || 0);
    const questionsAnswered = Number(overallStats[0]?.questions_answered || 0);
    const sectionsPracticed = sectionStats.length;
    const totalSectionsCount = Number(totalSections[0]?.count || 0);
    
    // Calculate trend
    let recentTrend = 0;
    if (recentTests.length >= 10) {
      const recent10 = recentTests.slice(0, 10);
      const previous10 = recentTests.slice(10, 20);
      const recentAvg = recent10.reduce((sum, t) => sum + (Number(t.accuracy) || 0), 0) / recent10.length;
      const previousAvg = previous10.reduce((sum, t) => sum + (Number(t.accuracy) || 0), 0) / previous10.length;
      recentTrend = recentAvg - previousAvg;
    }
    
    console.log('\n📊 Raw Data:');
    console.log(`   Overall Accuracy: ${avgAccuracy.toFixed(2)}%`);
    console.log(`   Tests Completed: ${testsCompleted}`);
    console.log(`   Questions Answered: ${questionsAnswered}`);
    console.log(`   Sections Practiced: ${sectionsPracticed} / ${totalSectionsCount}`);
    console.log(`   Recent Trend: ${recentTrend.toFixed(2)}%`);
    
    console.log('\n🧮 Calculation:');
    
    // Factor 1: Accuracy (40% weight)
    const accuracyScore = Math.min(avgAccuracy, 100) * 0.4;
    console.log(`   1. Accuracy Score = ${avgAccuracy.toFixed(2)} × 0.4 = ${accuracyScore.toFixed(2)}`);
    
    // Factor 2: Coverage (30% weight)
    const coverageRatio = totalSectionsCount > 0 ? sectionsPracticed / totalSectionsCount : 0;
    const coverageScore = coverageRatio * 30;
    console.log(`   2. Coverage Score = (${sectionsPracticed}/${totalSectionsCount}) × 30 = ${coverageScore.toFixed(2)}`);
    
    // Factor 3: Trend (20% weight)
    const trendScore = Math.max(0, Math.min(20, 10 + recentTrend));
    console.log(`   3. Trend Score = max(0, min(20, 10 + ${recentTrend.toFixed(2)})) = ${trendScore.toFixed(2)}`);
    
    // Factor 4: Volume (10% weight)
    const volumeRatio = Math.min(testsCompleted / 50, 1);
    const volumeScore = volumeRatio * 10;
    console.log(`   4. Volume Score = min(${testsCompleted}/50, 1) × 10 = ${volumeScore.toFixed(2)}`);
    
    // Overall Readiness
    const overallReadiness = Math.round(accuracyScore + coverageScore + trendScore + volumeScore);
    
    console.log('\n✅ Final Score:');
    console.log(`   Overall Readiness = ${accuracyScore.toFixed(2)} + ${coverageScore.toFixed(2)} + ${trendScore.toFixed(2)} + ${volumeScore.toFixed(2)}`);
    console.log(`                     = ${overallReadiness}%`);
    
    let status = '';
    if (overallReadiness >= 80) status = '🎉 READY';
    else if (overallReadiness >= 60) status = '🚀 ALMOST READY';
    else if (overallReadiness >= 40) status = '📚 GETTING THERE';
    else status = '🎯 NOT READY';
    
    console.log(`   Status: ${status}`);
    
    // Section breakdown
    console.log('\n📋 Section-wise Readiness:');
    sectionStats.forEach((section, i) => {
      const accuracy = Number(section.accuracy || 0);
      const questionsAttempted = Number(section.questions_attempted || 0);
      
      const accuracyFactor = Math.min(accuracy, 100) * 0.7;
      const volumeFactor = Math.min(questionsAttempted / 100, 1) * 30;
      const readiness = Math.round(accuracyFactor + volumeFactor);
      
      let icon = '';
      if (readiness >= 85) icon = '✅';
      else if (readiness >= 70) icon = '🟢';
      else if (readiness >= 50) icon = '🟡';
      else icon = '🔴';
      
      console.log(`   ${icon} ${section.section_name}: ${readiness}% (${accuracy.toFixed(1)}% acc, ${questionsAttempted} qs)`);
    });
    
    // ============================================
    // 2. ACHIEVEMENTS SYSTEM
    // ============================================
    console.log('\n\n2️⃣  ACHIEVEMENTS SYSTEM\n');
    console.log('-'.repeat(70));
    
    // Get perfect scores
    const perfectScores = await sql`
      SELECT COUNT(*) as count
      FROM user_test_attempts
      WHERE user_id = ${userId}
        AND status = 'submitted'
        AND correct_answers = (correct_answers + incorrect_answers + unanswered)
        AND (correct_answers + incorrect_answers + unanswered) > 0
    `;
    
    // Get streak data
    const activityDates = await sql`
      SELECT DATE(submitted_at)::text as date
      FROM user_test_attempts
      WHERE user_id = ${userId}
        AND status = 'submitted'
        AND submitted_at IS NOT NULL
      GROUP BY DATE(submitted_at)
      ORDER BY DATE(submitted_at) DESC
    `;
    
    // Calculate streak (simplified)
    const dates = activityDates.map(d => new Date(d.date));
    let currentStreak = 0;
    let longestStreak = 1;
    let tempStreak = 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dates.length > 0) {
      const lastDate = dates[0];
      const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysSince <= 1) {
        currentStreak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
          const diff = Math.floor((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
      
      // Calculate longest
      for (let i = 0; i < dates.length - 1; i++) {
        const diff = Math.floor((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }
    
    const bestAccuracy = recentTests.length > 0 ? Math.max(...recentTests.map(t => Number(t.accuracy) || 0)) : 0;
    const perfectScoreCount = Number(perfectScores[0]?.count || 0);
    
    console.log('\n📊 User Progress:');
    console.log(`   Tests Completed: ${testsCompleted}`);
    console.log(`   Questions Answered: ${questionsAnswered}`);
    console.log(`   Best Accuracy: ${bestAccuracy.toFixed(1)}%`);
    console.log(`   Current Streak: ${currentStreak} days`);
    console.log(`   Longest Streak: ${longestStreak} days`);
    console.log(`   Sections Attempted: ${sectionsPracticed} / ${totalSectionsCount}`);
    console.log(`   Perfect Scores: ${perfectScoreCount}`);
    
    // Check achievements
    const achievements = [
      { name: 'First Steps', type: 'tests_count', value: 1, points: 10 },
      { name: 'Getting Started', type: 'tests_count', value: 10, points: 25 },
      { name: 'Dedicated Learner', type: 'tests_count', value: 50, points: 50 },
      { name: 'Question Master', type: 'questions_count', value: 100, points: 20 },
      { name: 'Question Expert', type: 'questions_count', value: 500, points: 50 },
      { name: 'Question Legend', type: 'questions_count', value: 1000, points: 100 },
      { name: 'High Achiever', type: 'accuracy', value: 90, points: 30 },
      { name: 'Perfect Score', type: 'perfect_score', value: 1, points: 50 },
      { name: 'Week Warrior', type: 'streak_days', value: 7, points: 25 },
      { name: 'Month Master', type: 'streak_days', value: 30, points: 75 },
    ];
    
    console.log('\n🏆 Achievement Status:');
    
    let totalPoints = 0;
    achievements.forEach(achievement => {
      let current = 0;
      let unlocked = false;
      
      switch (achievement.type) {
        case 'tests_count':
          current = testsCompleted;
          unlocked = testsCompleted >= achievement.value;
          break;
        case 'questions_count':
          current = questionsAnswered;
          unlocked = questionsAnswered >= achievement.value;
          break;
        case 'accuracy':
          current = bestAccuracy;
          unlocked = bestAccuracy >= achievement.value;
          break;
        case 'perfect_score':
          current = perfectScoreCount;
          unlocked = perfectScoreCount >= achievement.value;
          break;
        case 'streak_days':
          current = Math.max(currentStreak, longestStreak);
          unlocked = current >= achievement.value;
          break;
      }
      
      const progress = Math.min(Math.round((current / achievement.value) * 100), 100);
      const icon = unlocked ? '✅' : '🔒';
      
      if (unlocked) {
        totalPoints += achievement.points;
        console.log(`   ${icon} ${achievement.name} (${achievement.points} pts) - UNLOCKED!`);
      } else {
        console.log(`   ${icon} ${achievement.name} (${achievement.points} pts) - ${progress}% (${current}/${achievement.value})`);
      }
    });
    
    console.log(`\n   🎖️  Total Points Earned: ${totalPoints}`);
    
    // ============================================
    // 3. SECTION AWARENESS / COVERAGE MAP
    // ============================================
    console.log('\n\n3️⃣  SECTION AWARENESS (Coverage Map)\n');
    console.log('-'.repeat(70));
    
    // Get all sections
    const allSections = await sql`
      SELECT id, name FROM sections ORDER BY name
    `;
    
    console.log('\n🗺️  Section Status Map:\n');
    
    const sectionMap = new Map();
    sectionStats.forEach(s => {
      sectionMap.set(s.section_id, {
        name: s.section_name,
        accuracy: Number(s.accuracy || 0),
        questions: Number(s.questions_attempted || 0)
      });
    });
    
    let statusCounts = {
      'mastered': 0,
      'proficient': 0,
      'developing': 0,
      'needs-work': 0,
      'not-attempted': 0
    };
    
    allSections.forEach(section => {
      const stats = sectionMap.get(section.id);
      
      if (!stats || stats.questions === 0) {
        console.log(`   ⚪ ${section.name}`);
        console.log(`      Status: NOT ATTEMPTED`);
        console.log(`      Action: Start practicing this section\n`);
        statusCounts['not-attempted']++;
        return;
      }
      
      const acc = stats.accuracy;
      const qs = stats.questions;
      
      let status, icon, action;
      
      if (acc >= 85 && qs >= 50) {
        status = 'MASTERED ✅';
        icon = '✅';
        action = 'Excellent! Maintain with periodic review';
        statusCounts['mastered']++;
      } else if (acc >= 75 && qs >= 30) {
        status = 'PROFICIENT 🟢';
        icon = '🟢';
        action = 'Good progress! Practice more complex questions';
        statusCounts['proficient']++;
      } else if (acc >= 60 && qs >= 20) {
        status = 'DEVELOPING 🟡';
        icon = '🟡';
        action = 'Keep practicing to improve accuracy';
        statusCounts['developing']++;
      } else {
        status = 'NEEDS WORK 🔴';
        icon = '🔴';
        action = 'Focus here! Review concepts and practice more';
        statusCounts['needs-work']++;
      }
      
      console.log(`   ${icon} ${section.name}`);
      console.log(`      Status: ${status}`);
      console.log(`      Stats: ${acc.toFixed(1)}% accuracy • ${qs} questions attempted`);
      console.log(`      Action: ${action}\n`);
    });
    
    console.log('\n📈 Coverage Summary:');
    console.log(`   ✅ Mastered: ${statusCounts['mastered']}`);
    console.log(`   🟢 Proficient: ${statusCounts['proficient']}`);
    console.log(`   🟡 Developing: ${statusCounts['developing']}`);
    console.log(`   🔴 Needs Work: ${statusCounts['needs-work']}`);
    console.log(`   ⚪ Not Attempted: ${statusCounts['not-attempted']}`);
    console.log(`\n   📊 Overall Coverage: ${sectionsPracticed}/${totalSectionsCount} sections (${((sectionsPracticed/totalSectionsCount)*100).toFixed(0)}%)`);
    
    // ============================================
    // RECOMMENDATIONS
    // ============================================
    console.log('\n\n💡 PERSONALIZED RECOMMENDATIONS\n');
    console.log('-'.repeat(70));
    
    if (overallReadiness < 60) {
      console.log('\n1. 🎯 Focus on weak sections (🔴 Needs Work)');
      console.log('2. 📚 Increase practice volume (aim for 50 tests)');
      console.log('3. 🔥 Build a study streak for consistency');
    } else if (overallReadiness < 80) {
      console.log('\n1. 🎯 Polish your weak areas');
      console.log('2. ✅ Complete all sections to improve coverage');
      console.log('3. 📈 Maintain your improvement trend');
    } else {
      console.log('\n1. ✅ Excellent preparation!');
      console.log('2. 🔄 Do regular revision of all sections');
      console.log('3. 🎯 Take full-length mock tests');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Analysis Complete!');
    console.log('='.repeat(70) + '\n');
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
  }
}

demonstrateProgressFeatures();

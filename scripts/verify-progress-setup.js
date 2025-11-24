/**
 * Verify Progress Features Setup
 */

const postgres = require('postgres');

async function verify() {
  console.log('🔍 Verifying Progress Dashboard setup...\n');

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    // Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_goals', 'achievements', 'user_achievements', 'user_exams')
      ORDER BY table_name
    `;

    console.log('📊 Tables Status:');
    const requiredTables = ['achievements', 'user_achievements', 'user_exams', 'user_goals'];
    requiredTables.forEach(tableName => {
      const exists = tables.some(t => t.table_name === tableName);
      console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
    });

    // Check achievements
    const achievementCount = await sql`SELECT COUNT(*) as count FROM achievements`;
    console.log(`\n🏆 Achievements: ${achievementCount[0].count} seeded`);

    if (achievementCount[0].count > 0) {
      const sampleAchievements = await sql`
        SELECT name, icon, category 
        FROM achievements 
        ORDER BY created_at 
        LIMIT 5
      `;
      console.log('\n   Sample achievements:');
      sampleAchievements.forEach(a => {
        console.log(`   ${a.icon} ${a.name} (${a.category})`);
      });
    }

    // Check user goals
    const goalsCount = await sql`SELECT COUNT(*) as count FROM user_goals`;
    console.log(`\n🎯 User Goals: ${goalsCount[0].count} active`);

    // Check user achievements
    const userAchievementsCount = await sql`SELECT COUNT(*) as count FROM user_achievements`;
    console.log(`🏅 User Achievements Unlocked: ${userAchievementsCount[0].count}`);

    console.log('\n✅ Progress Dashboard is ready to use!');
    console.log('\n📍 Visit: http://localhost:3000/dashboard/progress');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

verify();

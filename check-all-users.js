const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    console.log('🔍 Checking all users and their test attempts...\n');
    
    const result = await sql`
      SELECT 
        u.email,
        u.id,
        COUNT(DISTINCT DATE(uta.submitted_at)) as unique_practice_days,
        COUNT(uta.id) as total_tests
      FROM users u
      LEFT JOIN user_test_attempts uta ON u.id = uta.user_id AND uta.status = 'submitted'
      GROUP BY u.id, u.email
      ORDER BY unique_practice_days DESC
    `;
    
    console.log('Users with activity:\n');
    result.forEach(user => {
      if (user.total_tests > 0) {
        console.log(`📧 ${user.email}`);
        console.log(`   Days practiced: ${user.unique_practice_days}`);
        console.log(`   Total tests: ${user.total_tests}`);
        console.log('');
      }
    });
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
})();

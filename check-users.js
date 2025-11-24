const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    const users = await sql`
      SELECT u.id, u.email, COUNT(uta.id) as test_count
      FROM users u
      LEFT JOIN user_test_attempts uta ON u.id = uta.user_id AND uta.status = 'submitted'
      GROUP BY u.id, u.email
      HAVING COUNT(uta.id) > 0
      ORDER BY COUNT(uta.id) DESC
      LIMIT 5
    `;
    
    console.log('Users with test attempts:');
    users.forEach(u => console.log(`  ${u.email}: ${u.test_count} tests`));
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
})();

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

(async () => {
  try {
    const activityDates = await sql`
      SELECT 
        DATE(submitted_at) as date,
        DATE(submitted_at)::text as date_string,
        submitted_at,
        submitted_at::date as date_only
      FROM user_test_attempts
      WHERE user_id = (SELECT id FROM users WHERE email = 'muthu08812@gmail.com')
        AND status = 'submitted'
        AND submitted_at IS NOT NULL
      GROUP BY DATE(submitted_at), submitted_at
      ORDER BY DATE(submitted_at) DESC
      LIMIT 15
    `;
    
    console.log('📅 Database dates analysis:\n');
    activityDates.forEach((d, i) => {
      console.log(`${i + 1}.`);
      console.log(`   date: ${d.date}`);
      console.log(`   date_string: ${d.date_string}`);
      console.log(`   submitted_at: ${d.submitted_at}`);
      console.log(`   date_only: ${d.date_only}`);
      console.log('');
    });
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
})();

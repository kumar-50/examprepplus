const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

(async () => {
  try {
    const result = await sql`SELECT status, COUNT(*) as count FROM questions GROUP BY status`;
    console.log('Question status counts:');
    console.table(result);
    
    const sample = await sql`SELECT id, question_text, status FROM questions LIMIT 5`;
    console.log('\nSample questions:');
    console.table(sample);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
})();

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

(async () => {
  try {
    const result = await sql`
      UPDATE questions 
      SET 
        status = 'pending', 
        is_verified = false, 
        verified_by = NULL, 
        verified_at = NULL
    `;
    
    console.log('✅ Updated all questions to pending status');
    console.log('Rows affected:', result.count);
    
    // Verify
    const counts = await sql`SELECT status, COUNT(*) as count FROM questions GROUP BY status`;
    console.log('\nStatus distribution:');
    console.table(counts);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
})();

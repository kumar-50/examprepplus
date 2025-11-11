const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

(async () => {
  try {
    // Update first 500 questions to approved
    const result = await sql`
      UPDATE questions 
      SET 
        status = 'approved', 
        is_verified = true,
        verified_at = NOW()
      WHERE id IN (
        SELECT id FROM questions 
        ORDER BY created_at 
        LIMIT 500
      )
    `;
    
    console.log('✅ Updated 500 questions to approved status');
    console.log('Rows affected:', result.count);
    
    // Verify status distribution
    const counts = await sql`
      SELECT status, COUNT(*) as count 
      FROM questions 
      GROUP BY status
    `;
    
    console.log('\nStatus distribution:');
    console.table(counts);
    
    // Check approved count by section
    const sectionCounts = await sql`
      SELECT 
        s.name as section_name,
        COUNT(q.id) as approved_count
      FROM questions q
      JOIN sections s ON q.section_id = s.id
      WHERE q.status = 'approved'
      GROUP BY s.id, s.name
      ORDER BY s.name
    `;
    
    console.log('\nApproved questions by section:');
    console.table(sectionCounts);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
})();

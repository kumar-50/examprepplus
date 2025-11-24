const { Pool } = require('pg');

async function verifyTestTypes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking test types in database...\n');
    
    const result = await pool.query(`
      SELECT test_type, COUNT(*) as count
      FROM tests
      GROUP BY test_type
      ORDER BY test_type
    `);

    console.log('📊 Current test type distribution:');
    result.rows.forEach(row => {
      console.log(`   ${row.test_type}: ${row.count} tests`);
    });
    
    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyTestTypes();

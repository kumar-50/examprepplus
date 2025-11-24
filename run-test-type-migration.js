/**
 * Run Test Type Migration
 * Updates test types from ['mock', 'live', 'sectional', 'practice'] to ['mock-test', 'sectional', 'practice']
 */

const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Starting test type migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'update-test-types.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by statements (simple split on semicolons)
    const statements = migrationSQL
      .split('--')
      .join('')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        await pool.query(statement);
        console.log(`✅ Statement ${i + 1} completed\n`);
      }
    }

    // Verify the changes
    console.log('🔍 Verifying migration results...\n');
    const result = await pool.query(`
      SELECT test_type, COUNT(*) as count
      FROM tests
      GROUP BY test_type
      ORDER BY test_type;
    `);

    console.log('📊 Current test type distribution:');
    result.rows.forEach(row => {
      console.log(`   ${row.test_type}: ${row.count} tests`);
    });

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

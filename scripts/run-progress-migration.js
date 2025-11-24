/**
 * Run Progress Features Migration
 */

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

async function runMigration() {
  console.log('🚀 Starting Progress Dashboard migration...\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  const sql = postgres(connectionString, {
    ssl: 'require',
  });

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'progress_features.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🔄 Executing migration...\n');

    // Execute migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_goals', 'achievements', 'user_achievements', 'user_exams')
      ORDER BY table_name
    `;

    if (tables.length === 4) {
      console.log('✅ All tables created:');
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    } else {
      console.log('⚠️  Some tables may not have been created');
      console.log('Found:', tables.map(t => t.table_name).join(', '));
    }

    // Check achievements count
    const achievementCount = await sql`SELECT COUNT(*) as count FROM achievements`;
    console.log(`\n✅ Achievements seeded: ${achievementCount[0].count} achievements\n`);

    console.log('🎉 Progress Dashboard setup complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();

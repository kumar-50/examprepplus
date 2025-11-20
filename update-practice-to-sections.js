/**
 * Update Practice Mode to use Sections
 * Migrates from topics to sections
 * 
 * Usage: node update-practice-to-sections.js
 */

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const { readFileSync } = require('fs');
const { join } = require('path');

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    
    const migrationPath = join(__dirname, 'migrations', 'update-practice-to-sections.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('🔌 Connecting to database...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const client = postgres(databaseUrl);
    
    console.log('🚀 Updating practice mode to use sections...');
    
    await client.unsafe(migrationSQL);
    
    console.log('✅ Migration applied successfully!');
    console.log('\nChanges:');
    console.log('  - weak_topics now uses section_id (instead of topic_id)');
    console.log('  - revision_schedule now uses section_ids (instead of topic_ids)');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();

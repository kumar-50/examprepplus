/**
 * Apply Practice Mode Migration
 * Runs the SQL migration to create weak_topics and revision_schedule tables
 * 
 * Usage: node apply-practice-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { readFileSync } = require('fs');
const { join } = require('path');

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    
    const migrationPath = join(__dirname, 'migrations', 'add-practice-mode-tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('🔌 Connecting to database...');
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create connection
    const client = postgres(databaseUrl);
    const db = drizzle(client);
    
    console.log('🚀 Applying practice mode migration...');
    
    // Execute the migration SQL
    await client.unsafe(migrationSQL);
    
    console.log('✅ Migration applied successfully!');
    console.log('\nTables created:');
    console.log('  - weak_topics');
    console.log('  - revision_schedule');
    console.log('\nColumn added:');
    console.log('  - user_test_attempts.scheduled_for');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();

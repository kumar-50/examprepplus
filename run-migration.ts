import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql);

async function runMigration() {
  try {
    console.log('🚀 Starting migration...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync(
      path.join(process.cwd(), 'drizzle', '0010_add-referrals-analytics.sql'),
      'utf-8'
    );

    // Split by statement breakpoint and execute
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      await sql.unsafe(statement);
      console.log(`✅ Statement ${i + 1} completed`);
    }

    console.log('\n✨ Migration completed successfully!');
    
    // Verify tables exist
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('referrals', 'payment_analytics')
    `;
    
    console.log('\n📊 Verification:');
    console.log('Tables created:', result.map(r => r.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration();

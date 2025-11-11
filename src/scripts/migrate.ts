import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const runMigrations = async () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  console.log('🔄 Connecting to database...')
  
  const sql = postgres(databaseUrl, { max: 1 })

  try {
    // Get list of SQL files in drizzle directory
    const migrationsDir = join(process.cwd(), 'drizzle')
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()

    console.log(`📁 Found ${files.length} migration files`)

    // Create migrations tracking table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS __manual_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Get already executed migrations
    const executed = await sql`
      SELECT filename FROM __manual_migrations
    `
    const executedFiles = new Set(executed.map(r => r.filename))

    // Run each migration that hasn't been executed
    for (const file of files) {
      if (executedFiles.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`)
        continue
      }

      console.log(`🚀 Running migration: ${file}`)
      
      const content = readFileSync(join(migrationsDir, file), 'utf-8')
      
      try {
        // Execute the migration
        await sql.unsafe(content)
        
        // Mark as executed
        await sql`
          INSERT INTO __manual_migrations (filename) 
          VALUES (${file})
        `
        
        console.log(`✅ Completed: ${file}`)
      } catch (error: any) {
        // Check if error is because resource already exists (safe to ignore)
        if (
          error.message?.includes('already exists') ||
          error.code === '42710' || // duplicate_object
          error.code === '42P07'    // duplicate_table
        ) {
          console.log(`⚠️  ${file}: Resources already exist (skipping)`)
          // Still mark as executed
          await sql`
            INSERT INTO __manual_migrations (filename) 
            VALUES (${file})
            ON CONFLICT (filename) DO NOTHING
          `
        } else {
          throw error
        }
      }
    }

    console.log('✅ All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
    console.log('👋 Database connection closed')
  }
}

runMigrations()

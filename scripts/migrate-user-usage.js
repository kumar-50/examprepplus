// Check if user_usage table exists and create it if not
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if table exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_usage'
      );
    `);
    
    const tableExists = checkResult.rows[0].exists;
    console.log('Table user_usage exists:', tableExists);
    
    if (!tableExists) {
      console.log('Creating user_usage table...');
      
      // Create the table
      await pool.query(`
        CREATE TABLE "user_usage" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" uuid NOT NULL,
          "feature" varchar(50) NOT NULL,
          "period" varchar(20) NOT NULL,
          "period_date" date,
          "count" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      console.log('Table created.');
      
      // Add foreign key
      await pool.query(`
        ALTER TABLE "user_usage" 
        ADD CONSTRAINT "user_usage_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") 
        REFERENCES "public"."users"("id") 
        ON DELETE cascade ON UPDATE no action;
      `);
      console.log('Foreign key added.');
      
      // Create indexes
      await pool.query(`
        CREATE INDEX "user_usage_user_feature_idx" 
        ON "user_usage" USING btree ("user_id","feature");
      `);
      console.log('Index created.');
      
      await pool.query(`
        CREATE UNIQUE INDEX "user_usage_unique_idx" 
        ON "user_usage" USING btree ("user_id","feature","period","period_date");
      `);
      console.log('Unique index created.');
      
      console.log('✅ Migration complete!');
    } else {
      console.log('✅ Table already exists, skipping migration.');
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

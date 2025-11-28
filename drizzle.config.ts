import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

// Also try loading .env.local for local development
import { config } from 'dotenv';
config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Use the pooler connection that works
    url: process.env.DATABASE_URL!,
  },
});

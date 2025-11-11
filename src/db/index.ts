import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// For Supabase pooler connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  prepare: false, // Required for pooler/transaction mode
  ssl: 'require',
});

export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };

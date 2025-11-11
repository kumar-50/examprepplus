import 'dotenv/config';
import { db } from './db';
import { sections } from './db/schema';

async function testConnection() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    console.log('Testing database connection...');
    const result = await db.select().from(sections);
    console.log('✅ Connection successful!');
    console.log('Found', result.length, 'sections');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();

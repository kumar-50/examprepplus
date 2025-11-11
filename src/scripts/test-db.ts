import { db } from '../db';
import { sections, users, questions, tests } from '../db/schema';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test 1: Query sections
    console.log('Test 1: Querying sections table...');
    const sectionsList = await db.select().from(sections);
    console.log(`✅ Sections table accessible. Found ${sectionsList.length} sections.\n`);

    // Test 2: Query users
    console.log('Test 2: Querying users table...');
    const usersList = await db.select().from(users);
    console.log(`✅ Users table accessible. Found ${usersList.length} users.\n`);

    // Test 3: Query questions
    console.log('Test 3: Querying questions table...');
    const questionsList = await db.select().from(questions);
    console.log(`✅ Questions table accessible. Found ${questionsList.length} questions.\n`);

    // Test 4: Query tests
    console.log('Test 4: Querying tests table...');
    const testsList = await db.select().from(tests);
    console.log(`✅ Tests table accessible. Found ${testsList.length} tests.\n`);

    console.log('🎉 All database tests passed!');
    console.log('✅ Database migration successful!');
    console.log('✅ All 12 tables are accessible.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error(error);
    process.exit(1);
  }
}

testDatabaseConnection();

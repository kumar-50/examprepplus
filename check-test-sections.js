import { db } from './src/db/index.js';
import { testQuestions, sections, tests } from './src/db/schema/index.js';
import { sql } from 'drizzle-orm';

async function checkTestSections() {
  console.log('🔍 Checking test questions and their sections...\n');

  // Get all tests
  const allTests = await db.select().from(tests).limit(5);
  console.log('📝 Tests found:', allTests.length);

  for (const test of allTests) {
    console.log(`\n📊 Test: ${test.title} (ID: ${test.id})`);
    
    // Get sections for this test
    const testSections = await db
      .select({
        sectionId: testQuestions.sectionId,
        questionCount: sql`count(*)::int`.as('questionCount'),
      })
      .from(testQuestions)
      .where(sql`${testQuestions.testId} = ${test.id}`)
      .groupBy(testQuestions.sectionId);

    console.log(`   Sections in test:`, testSections);

    if (testSections.length > 0) {
      for (const ts of testSections) {
        if (ts.sectionId) {
          const [section] = await db
            .select()
            .from(sections)
            .where(sql`${sections.id} = ${ts.sectionId}`)
            .limit(1);
          console.log(`   - ${section?.name || 'Unknown'}: ${ts.questionCount} questions`);
        } else {
          console.log(`   - No section assigned: ${ts.questionCount} questions`);
        }
      }
    } else {
      console.log('   ⚠️  No questions found for this test');
    }
  }

  process.exit(0);
}

checkTestSections().catch(console.error);

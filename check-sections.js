import { db } from './src/db/index.js';
import { sections, questions } from './src/db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

async function checkSections() {
  try {
    // Get all sections with approved question counts
    const secs = await db
      .select({
        id: sections.id,
        name: sections.name,
        approvedCount: sql`count(CASE WHEN ${questions.status} = 'approved' AND ${questions.isVerified} = true THEN 1 END)::int`,
      })
      .from(sections)
      .leftJoin(questions, eq(sections.id, questions.sectionId))
      .groupBy(sections.id, sections.name)
      .orderBy(sections.name);

    console.log('\n=== Sections with Approved Question Counts ===\n');
    secs.forEach((sec) => {
      console.log(`${sec.name}: ${sec.approvedCount} approved questions`);
    });

    console.log('\n=== Section IDs for Testing ===\n');
    secs.forEach((sec) => {
      console.log(`${sec.name}: ${sec.id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSections();

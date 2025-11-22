import { db } from './src/db';
import { revisionSchedule } from './src/db/schema';

async function checkSchedule() {
  try {
    console.log('🔍 Checking revision_schedule table...');
    
    const schedules = await db.select().from(revisionSchedule);
    
    console.log(`\nFound ${schedules.length} scheduled sessions:\n`);
    schedules.forEach(s => {
      console.log({
        id: s.id,
        userId: s.userId,
        scheduledDate: s.scheduledDate,
        sectionIds: s.sectionIds,
        questionCount: s.questionCount,
        difficulty: s.difficulty,
        attemptId: s.attemptId,
        createdAt: s.createdAt
      });
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSchedule();

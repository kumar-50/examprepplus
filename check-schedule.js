const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { revisionSchedule } = require('./src/db/schema/practice-sessions');
require('dotenv').config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: 'require',
});

const db = drizzle(client);

async function checkSchedule() {
  try {
    console.log('🔍 Checking revision_schedule table...');
    
    const schedules = await db.select().from(revisionSchedule);
    
    console.log(`Found ${schedules.length} scheduled sessions:`);
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
    });
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

checkSchedule();

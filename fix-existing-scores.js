// Quick script to fix scores for existing submissions
import { db } from './src/db/index.ts';
import { userTestAttempts } from './src/db/schema/index.ts';
import { sql } from 'drizzle-orm';

async function fixScores() {
  console.log('🔧 Fixing scores for existing submissions...');
  
  // Update all records where score is null but correctAnswers exists
  const result = await db
    .update(userTestAttempts)
    .set({
      score: sql`correct_answers`,
    })
    .where(sql`score IS NULL AND correct_answers IS NOT NULL`);
  
  console.log('✅ Updated records with scores!');
}

fixScores()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

/**
 * Seed default achievements into the database
 * Run with: node scripts/seed-achievements.js
 */

const { db } = require('../src/db');
const { achievements } = require('../src/db/schema');
const { DEFAULT_ACHIEVEMENTS } = require('../src/lib/achievements');

async function seedAchievements() {
  console.log('🌱 Seeding default achievements...');

  try {
    // Check if achievements already exist
    const existingAchievements = await db.select().from(achievements);
    
    if (existingAchievements.length > 0) {
      console.log(`✅ Found ${existingAchievements.length} existing achievements`);
      console.log('Skipping seed (achievements already exist)');
      return;
    }

    // Insert default achievements
    const inserted = await db
      .insert(achievements)
      .values(DEFAULT_ACHIEVEMENTS)
      .returning();

    console.log(`✅ Successfully seeded ${inserted.length} achievements:`);
    inserted.forEach((achievement) => {
      console.log(`   ${achievement.icon} ${achievement.name} (${achievement.category})`);
    });

    console.log('\n✨ Achievement seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedAchievements();

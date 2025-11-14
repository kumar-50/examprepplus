const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function seedFromJSON() {
  try {
    console.log('Starting database seed from JSON files...\n');

    // Read JSON files
    const sectionsPath = path.join(__dirname, '../data/seed_sections.json');
    const questionsPath = path.join(__dirname, '../data/seed_questions.json');

    if (!fs.existsSync(sectionsPath) || !fs.existsSync(questionsPath)) {
      console.error('Error: JSON files not found!');
      console.log('Run "npm run csv:convert" first to generate JSON files');
      process.exit(1);
    }

    const sections = JSON.parse(fs.readFileSync(sectionsPath, 'utf-8'));
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

    console.log(`Found ${sections.length} sections and ${questions.length} questions\n`);

    // Insert sections
    console.log('Seeding sections...');
    for (const section of sections) {
      await sql`
        INSERT INTO sections (name, description, created_at, updated_at)
        VALUES (
          ${section.name},
          ${section.description},
          ${section.created_at},
          ${section.updated_at}
        )
        ON CONFLICT (name) DO UPDATE
        SET 
          description = EXCLUDED.description,
          updated_at = EXCLUDED.updated_at
      `;
    }
    console.log(`✓ Seeded ${sections.length} sections\n`);

    // Get section IDs for questions
    const dbSections = await sql`SELECT id, name FROM sections`;
    const sectionMap = {};
    dbSections.forEach(section => {
      sectionMap[section.name] = section.id;
    });

    // Insert questions
    console.log('Seeding questions...');
    let insertedCount = 0;
    let skippedCount = 0;

    for (const question of questions) {
      const sectionId = sectionMap[sections.find(s => s.id === question.section_id)?.name];
      
      if (!sectionId) {
        console.log(`Warning: Section not found for question "${question.question_text.substring(0, 50)}..."`);
        skippedCount++;
        continue;
      }

      // Check if question already exists
      const existing = await sql`
        SELECT id FROM questions 
        WHERE question_text = ${question.question_text}
        AND section_id = ${sectionId}
      `;

      if (existing.length > 0) {
        skippedCount++;
        continue;
      }

      await sql`
        INSERT INTO questions (
          section_id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation,
          difficulty,
          status,
          created_at,
          updated_at
        ) VALUES (
          ${sectionId},
          ${question.question_text},
          ${question.option_a},
          ${question.option_b},
          ${question.option_c},
          ${question.option_d},
          ${question.correct_answer},
          ${question.explanation},
          ${question.difficulty},
          ${question.status},
          ${question.created_at},
          ${question.updated_at}
        )
      `;
      insertedCount++;
    }

    console.log(`✓ Inserted ${insertedCount} new questions`);
    if (skippedCount > 0) {
      console.log(`  (Skipped ${skippedCount} duplicates)`);
    }

    // Display statistics
    const totalQuestions = await sql`SELECT COUNT(*) as count FROM questions`;
    const totalSections = await sql`SELECT COUNT(*) as count FROM sections`;

    console.log('\nDatabase Statistics:');
    console.log(`  Total Sections: ${totalSections[0].count}`);
    console.log(`  Total Questions: ${totalQuestions[0].count}`);

    console.log('\n✓ Seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedFromJSON();

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Parse header
  const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Parse rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === header.length) {
      const row = {};
      header.forEach((key, index) => {
        row[key] = values[index];
      });
      rows.push(row);
    }
  }
  
  return rows;
}

// Parse a single CSV line handling quotes
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

async function seedSections() {
  console.log('📦 Seeding sections...');
  
  const sectionsPath = path.join(__dirname, 'data', 'seed_sections.csv');
  const sections = parseCSV(sectionsPath);
  
  for (const section of sections) {
    const name = section.name.replace(/"/g, '');
    
    // Check if section exists
    const existing = await sql`
      SELECT id FROM sections WHERE name = ${name}
    `;
    
    if (existing.length === 0) {
      await sql`
        INSERT INTO sections (name, created_at, updated_at)
        VALUES (${name}, NOW(), NOW())
      `;
      console.log(`  ✅ Created section: ${name}`);
    } else {
      console.log(`  ⏭️  Section already exists: ${name}`);
    }
  }
  
  console.log('✅ Sections seeded successfully\n');
}

async function seedQuestions() {
  console.log('📦 Seeding questions...');
  
  const questionsPath = path.join(__dirname, 'data', 'seed_questions.csv');
  const questions = parseCSV(questionsPath);
  
  // Get all sections for mapping
  const sections = await sql`SELECT id, name FROM sections`;
  const sectionMap = {};
  sections.forEach(s => {
    sectionMap[s.name] = s.id;
  });
  
  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const q of questions) {
    try {
      const sectionName = q.section_name.replace(/"/g, '');
      const sectionId = sectionMap[sectionName];
      
      if (!sectionId) {
        console.log(`  ⚠️  Section not found: ${sectionName}`);
        errorCount++;
        continue;
      }
      
      const questionText = q.question_text.replace(/"/g, '');
      
      // Check if question already exists
      const existing = await sql`
        SELECT id FROM questions 
        WHERE question_text = ${questionText}
        LIMIT 1
      `;
      
      if (existing.length > 0) {
        skippedCount++;
        continue;
      }
      
      // Insert question
      await sql`
        INSERT INTO questions (
          section_id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          status,
          is_verified,
          verified_at,
          year,
          created_at,
          updated_at
        ) VALUES (
          ${sectionId},
          ${questionText},
          ${q.option_a.replace(/"/g, '')},
          ${q.option_b.replace(/"/g, '')},
          ${q.option_c.replace(/"/g, '')},
          ${q.option_d.replace(/"/g, '')},
          ${q.correct_index},
          'approved',
          true,
          NOW(),
          ${q.year || null},
          NOW(),
          NOW()
        )
      `;
      
      insertedCount++;
      
      if (insertedCount % 100 === 0) {
        console.log(`  📝 Inserted ${insertedCount} questions...`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error inserting question: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Questions seeded successfully`);
  console.log(`  📊 Inserted: ${insertedCount}`);
  console.log(`  ⏭️  Skipped (duplicates): ${skippedCount}`);
  console.log(`  ❌ Errors: ${errorCount}\n`);
}

async function displayStats() {
  console.log('📊 Database Statistics:\n');
  
  // Total sections
  const sectionCount = await sql`SELECT COUNT(*) as count FROM sections`;
  console.log(`Total Sections: ${sectionCount[0].count}`);
  
  // Total questions
  const questionCount = await sql`SELECT COUNT(*) as count FROM questions`;
  console.log(`Total Questions: ${questionCount[0].count}`);
  
  // Questions by section
  const sectionStats = await sql`
    SELECT 
      s.name as section_name,
      COUNT(q.id) as question_count,
      COUNT(CASE WHEN q.status = 'approved' THEN 1 END) as approved_count
    FROM sections s
    LEFT JOIN questions q ON s.id = q.section_id
    GROUP BY s.id, s.name
    ORDER BY s.name
  `;
  
  console.log('\nQuestions by Section:');
  console.table(sectionStats);
  
  // Questions by status
  const statusStats = await sql`
    SELECT 
      status,
      COUNT(*) as count
    FROM questions
    GROUP BY status
    ORDER BY status
  `;
  
  console.log('\nQuestions by Status:');
  console.table(statusStats);
}

async function main() {
  try {
    console.log('🚀 Starting CSV to Database Seed Process\n');
    console.log('=' .repeat(50));
    
    // Step 1: Seed sections
    await seedSections();
    
    // Step 2: Seed questions
    await seedQuestions();
    
    // Step 3: Display statistics
    await displayStats();
    
    console.log('=' .repeat(50));
    console.log('\n🎉 Seed process completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Seed process failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the script
main();

const fs = require('fs');
const path = require('path');

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

// Convert sections CSV to JSON
function convertSectionsToJSON() {
  const sectionsPath = path.join(__dirname, '../data/seed_sections.csv');
  const sections = parseCSV(sectionsPath);
  
  const sectionsJSON = sections.map((section, index) => ({
    id: index + 1,
    name: section.name,
    description: `Practice questions for ${section.name}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const outputPath = path.join(__dirname, '../data/seed_sections.json');
  fs.writeFileSync(outputPath, JSON.stringify(sectionsJSON, null, 2));
  console.log(`✓ Converted ${sectionsJSON.length} sections to ${outputPath}`);
  
  return sectionsJSON;
}

// Convert questions CSV to JSON
function convertQuestionsToJSON(sections) {
  const questionsPath = path.join(__dirname, '../data/seed_questions.csv');
  const questions = parseCSV(questionsPath);
  
  // Create a section name to ID mapping
  const sectionMap = {};
  sections.forEach(section => {
    sectionMap[section.name] = section.id;
  });
  
  const questionsJSON = questions.map((question, index) => {
    const sectionId = sectionMap[question.section] || 1;
    
    return {
      id: index + 1,
      section_id: sectionId,
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      explanation: question.explanation || null,
      difficulty: question.difficulty || 'medium',
      created_by: null, // Will be set during seeding
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  const outputPath = path.join(__dirname, '../data/seed_questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(questionsJSON, null, 2));
  console.log(`✓ Converted ${questionsJSON.length} questions to ${outputPath}`);
  
  return questionsJSON;
}

// Main function
async function main() {
  try {
    console.log('Converting CSV files to JSON...\n');
    
    // Convert sections first
    const sections = convertSectionsToJSON();
    
    // Convert questions with section references
    const questions = convertQuestionsToJSON(sections);
    
    console.log('\n✓ Conversion complete!');
    console.log(`  - Sections: ${sections.length}`);
    console.log(`  - Questions: ${questions.length}`);
    console.log('\nJSON files created in data/ directory');
    console.log('Run "npm run seed:json" to seed the database');
    
  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
    process.exit(1);
  }
}

main();

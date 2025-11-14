const fs = require('fs');
const path = require('path');

// Parse CSV content
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
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
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    return obj;
  });
}

// Read and convert sections
function convertSections() {
  const sectionsPath = path.join(__dirname, '../data/questions/seed_sections.csv');
  const content = fs.readFileSync(sectionsPath, 'utf-8');
  const sections = parseCSV(content);
  
  const formattedSections = sections.map((section, index) => ({
    id: index + 1,
    name: section.name.replace(/"/g, ''),
    description: `${section.name.replace(/"/g, '')} section for exam preparation`,
    order: index + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  return formattedSections;
}

// Read and convert questions
function convertQuestions(sections) {
  const questionsPath = path.join(__dirname, '../data/seed_questions.csv');
  const content = fs.readFileSync(questionsPath, 'utf-8');
  const questions = parseCSV(content);
  
  const formattedQuestions = questions.map((q, index) => {
    const section = sections.find(s => s.name === q.section_name.replace(/"/g, ''));
    const sectionId = section ? section.id : 1;
    
    return {
      id: index + 1,
      sectionId: sectionId,
      questionText: q.question_text.replace(/"/g, ''),
      optionA: q.option_a.replace(/"/g, ''),
      optionB: q.option_b.replace(/"/g, ''),
      optionC: q.option_c.replace(/"/g, ''),
      optionD: q.option_d.replace(/"/g, ''),
      correctAnswer: parseInt(q.correct_index),
      explanation: null,
      difficulty: 'medium',
      year: parseInt(q.year) || 2024,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
  
  return formattedQuestions;
}

// Main conversion function
function convertCSVToJSON() {
  console.log('Converting CSV files to JSON format...\n');
  
  // Convert sections
  const sections = convertSections();
  console.log(`✓ Converted ${sections.length} sections`);
  
  // Convert questions
  const questions = convertQuestions(sections);
  console.log(`✓ Converted ${questions.length} questions`);
  
  // Create output object
  const output = {
    sections,
    questions
  };
  
  // Write to JSON file
  const outputPath = path.join(__dirname, '../data/seed_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\n✓ Successfully created: ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`  - Sections: ${sections.length}`);
  console.log(`  - Questions: ${questions.length}`);
  
  // Display section breakdown
  console.log(`\nQuestions per section:`);
  sections.forEach(section => {
    const count = questions.filter(q => q.sectionId === section.id).length;
    console.log(`  - ${section.name}: ${count} questions`);
  });
}

// Run the conversion
try {
  convertCSVToJSON();
} catch (error) {
  console.error('Error during conversion:', error.message);
  process.exit(1);
}

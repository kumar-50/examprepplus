const fs = require('fs');
const path = require('path');

// Escape CSV field (handle quotes and commas)
function escapeCSV(field) {
  if (field == null) return '';
  const str = String(field);
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Read the source JSON file
function convertQuestionsJSON() {
  console.log('Converting questions JSON to CSV format for import...\n');
  
  const inputPath = path.join(__dirname, '../data/questions-31-last-set.json');
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  
  // Extract unique sections
  const sectionMap = new Map();
  const csvRows = [];
  
  // CSV Header - matching the expected format
  csvRows.push('question_text,option_a,option_b,option_c,option_d,correct_index,section_name,year');
  
  // Process all sections and questions
  data.sections.forEach(section => {
    section.sections.forEach(subSection => {
      // Track section
      if (!sectionMap.has(subSection.name)) {
        sectionMap.set(subSection.name, sectionMap.size + 1);
      }
      
      // Add questions as CSV rows
      subSection.questions.forEach(q => {
        const year = section.testInfo?.year || 2024;
        
        // Build CSV row
        const row = [
          escapeCSV(q.question),
          escapeCSV(q.options[0]),
          escapeCSV(q.options[1]),
          escapeCSV(q.options[2]),
          escapeCSV(q.options[3]),
          q.correctAnswer, // This is already 0-based index
          escapeCSV(subSection.name),
          year
        ].join(',');
        
        csvRows.push(row);
      });
    });
  });
  
  const sections = Array.from(sectionMap.keys());
  const questionCount = csvRows.length - 1; // Subtract header row
  
  console.log(`✓ Converted ${sections.length} sections`);
  console.log(`✓ Converted ${questionCount} questions`);
  
  // Write to CSV file
  const outputPath = path.join(__dirname, '../data/seed_questions_import.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf-8');
  
  console.log(`\n✓ Successfully created: ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`  - Sections: ${sections.length}`);
  console.log(`  - Questions: ${questionCount}`);
  console.log(`  - Format: CSV (ready for import)`);
  
  // Display section breakdown
  console.log(`\nSections found:`);
  sections.forEach((section, index) => {
    console.log(`  ${index + 1}. ${section}`);
  });
  
  console.log(`\n✓ File ready for CSV import via admin panel`);
  console.log(`  - Default status will be: pending`);
  console.log(`  - Sections will be auto-created if they don't exist`);
  
  return { sections, questionCount };
}

// Run the conversion
try {
  convertQuestionsJSON();
} catch (error) {
  console.error('Error during conversion:', error.message);
  console.error(error.stack);
  process.exit(1);
}

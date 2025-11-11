/**
 * Test script to verify CSV parsing functionality
 * Run this with: npx tsx src/scripts/test-csv-parser.ts
 */

import { parseCSV } from '../lib/csv-parser';
import fs from 'fs';
import path from 'path';

async function testCSVParser() {
  console.log('Testing CSV Parser...\n');

  // Create a test CSV file
  const testCSV = `question_text,option_a,option_b,option_c,option_d,correct_index,section_name,year
What is 2 + 2?,2,3,4,5,2,Mathematics,2024
What is the capital of France?,London,Paris,Berlin,Madrid,1,General Awareness,2024
Invalid question - missing option,A,B,C,,0,Math,2024
Invalid - bad correct index,A,B,C,D,5,Math,2024`;

  const testFile = new File([testCSV], 'test.csv', { type: 'text/csv' });

  try {
    const result = await parseCSV(testFile);
    
    console.log('Parse Result:');
    console.log(`- Total rows: ${result.totalRows}`);
    console.log(`- Valid questions: ${result.questions.length}`);
    console.log(`- Errors: ${result.errors.length}\n`);

    if (result.questions.length > 0) {
      console.log('Sample valid question:');
      console.log(JSON.stringify(result.questions[0], null, 2));
      console.log();
    }

    if (result.errors.length > 0) {
      console.log('Validation errors:');
      result.errors.forEach(error => {
        console.log(`  Row ${error.row}: ${error.field} - ${error.reason}`);
      });
      console.log();
    }

    console.log('✅ CSV Parser test completed successfully!');
  } catch (error) {
    console.error('❌ CSV Parser test failed:', error);
  }
}

testCSVParser();

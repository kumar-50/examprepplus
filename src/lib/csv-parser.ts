import Papa from 'papaparse';

export interface CSVRow {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: string;
  section_name: string;
  year: string;
}

export interface ParsedQuestion {
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: number;
  sectionName: string;
  year: string;
  rowNumber: number;
}

export interface ValidationError {
  row: number;
  field: string;
  reason: string;
}

export interface ParseResult {
  questions: ParsedQuestion[];
  errors: ValidationError[];
  totalRows: number;
}

/**
 * Validates a CSV row and returns any errors
 */
function validateRow(row: CSVRow, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!row.question_text?.trim()) {
    errors.push({ row: rowNumber, field: 'question_text', reason: 'Question text is required' });
  }
  if (!row.option_a?.trim()) {
    errors.push({ row: rowNumber, field: 'option_a', reason: 'Option A is required' });
  }
  if (!row.option_b?.trim()) {
    errors.push({ row: rowNumber, field: 'option_b', reason: 'Option B is required' });
  }
  if (!row.option_c?.trim()) {
    errors.push({ row: rowNumber, field: 'option_c', reason: 'Option C is required' });
  }
  if (!row.option_d?.trim()) {
    errors.push({ row: rowNumber, field: 'option_d', reason: 'Option D is required' });
  }
  if (!row.section_name?.trim()) {
    errors.push({ row: rowNumber, field: 'section_name', reason: 'Section name is required' });
  }

  // Validate correct_index
  const correctIndex = parseInt(row.correct_index);
  if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    errors.push({ 
      row: rowNumber, 
      field: 'correct_index', 
      reason: 'Correct index must be 0, 1, 2, or 3' 
    });
  }

  // Validate year (optional but must be valid if provided)
  if (row.year && row.year.trim()) {
    const year = parseInt(row.year);
    if (isNaN(year) || year < 1900 || year > 2100) {
      errors.push({ 
        row: rowNumber, 
        field: 'year', 
        reason: 'Year must be a valid year between 1900 and 2100' 
      });
    }
  }

  return errors;
}

/**
 * Converts a CSV row to a ParsedQuestion
 */
function rowToQuestion(row: CSVRow, rowNumber: number): ParsedQuestion {
  return {
    questionText: row.question_text.trim(),
    option1: row.option_a.trim(),
    option2: row.option_b.trim(),
    option3: row.option_c.trim(),
    option4: row.option_d.trim(),
    correctOption: parseInt(row.correct_index) + 1, // Convert 0-based to 1-based
    sectionName: row.section_name.trim(),
    year: row.year?.trim() || '',
    rowNumber,
  };
}

/**
 * Validates that the CSV has the required columns
 */
function validateColumns(headers: string[]): string[] {
  const requiredColumns = [
    'question_text',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_index',
    'section_name',
  ];

  const missingColumns: string[] = [];
  for (const col of requiredColumns) {
    if (!headers.includes(col)) {
      missingColumns.push(col);
    }
  }

  return missingColumns;
}

/**
 * Parses a CSV file and validates the data
 */
export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const questions: ParsedQuestion[] = [];
    const errors: ValidationError[] = [];
    let totalRows = 0;
    let headers: string[] = [];

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      step: (results, parser) => {
        totalRows++;

        // On first row, validate columns
        if (totalRows === 1) {
          headers = results.meta.fields || [];
          const missingColumns = validateColumns(headers);
          
          if (missingColumns.length > 0) {
            parser.abort();
            errors.push({
              row: 0,
              field: 'headers',
              reason: `Missing required columns: ${missingColumns.join(', ')}`,
            });
            return;
          }
        }

        const row = results.data;
        const rowNumber = totalRows;

        // Validate the row
        const rowErrors = validateRow(row, rowNumber);
        
        if (rowErrors.length > 0) {
          errors.push(...rowErrors);
        } else {
          // Convert to parsed question
          questions.push(rowToQuestion(row, rowNumber));
        }
      },
      complete: () => {
        resolve({
          questions,
          errors,
          totalRows,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

/**
 * Downloads the CSV template
 */
export function downloadTemplate() {
  const template = `question_text,option_a,option_b,option_c,option_d,correct_index,section_name,year
What is 2 + 2?,2,3,4,5,2,Mathematics,2024
What is the capital of France?,London,Paris,Berlin,Madrid,1,General Awareness,2024`;

  const blob = new Blob([template], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'questions_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

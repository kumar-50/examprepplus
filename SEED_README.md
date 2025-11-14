# CSV Seed Script

This script converts CSV data from `data/seed_sections.csv` and `data/seed_questions.csv` into the database.

## Features

- ✅ Parses CSV files with proper quote handling
- ✅ Creates sections from `seed_sections.csv`
- ✅ Creates questions from `seed_questions.csv`
- ✅ Prevents duplicate entries
- ✅ Links questions to correct sections
- ✅ Sets questions as approved and verified
- ✅ Displays detailed statistics after seeding

## Usage

```bash
npm run seed:csv
```

## CSV Format

### seed_sections.csv
```csv
name
"General Awareness"
"Mathematics"
"General Intelligence and Reasoning"
```

### seed_questions.csv
```csv
question_text,option_a,option_b,option_c,option_d,correct_index,section_name,year
"What is the capital of India?","Mumbai","Delhi","Kolkata","Chennai",1,"General Awareness",2024
```

**Fields:**
- `question_text`: The question text
- `option_a`: First option
- `option_b`: Second option
- `option_c`: Third option
- `option_d`: Fourth option
- `correct_index`: Index of correct answer (0=A, 1=B, 2=C, 3=D)
- `section_name`: Section name (must match a section in seed_sections.csv)
- `year`: Year of the question (optional)

## What it does

1. **Seeds Sections**: Creates all sections from `seed_sections.csv` if they don't exist
2. **Seeds Questions**: 
   - Inserts questions from `seed_questions.csv`
   - Links each question to its section
   - Skips duplicate questions
   - Sets status as 'approved' and marks as verified
3. **Shows Statistics**:
   - Total sections and questions
   - Questions by section
   - Questions by status

## Output Example

```
🚀 Starting CSV to Database Seed Process

==================================================
📦 Seeding sections...
  ✅ Created section: General Awareness
  ✅ Created section: Mathematics
  ✅ Created section: General Intelligence and Reasoning
✅ Sections seeded successfully

📦 Seeding questions...
  📝 Inserted 100 questions...
  📝 Inserted 200 questions...
  ...

✅ Questions seeded successfully
  📊 Inserted: 1541
  ⏭️  Skipped (duplicates): 0
  ❌ Errors: 0

📊 Database Statistics:

Total Sections: 3
Total Questions: 1541

Questions by Section:
┌─────────┬────────────────────────────────────────┬────────────────┬────────────────┐
│ (index) │             section_name               │ question_count │ approved_count │
├─────────┼────────────────────────────────────────┼────────────────┼────────────────┤
│    0    │        'General Awareness'             │      500       │      500       │
│    1    │           'Mathematics'                │      521       │      521       │
│    2    │ 'General Intelligence and Reasoning'   │      520       │      520       │
└─────────┴────────────────────────────────────────┴────────────────┴────────────────┘

Questions by Status:
┌─────────┬───────────┬───────┐
│ (index) │  status   │ count │
├─────────┼───────────┼───────┤
│    0    │ 'approved'│ 1541  │
└─────────┴───────────┴───────┘

==================================================

🎉 Seed process completed successfully!
```

## Notes

- The script checks for existing data and skips duplicates
- Questions are automatically linked to sections by name matching
- All imported questions are set to `approved` status with `is_verified = true`
- The script uses the `DATABASE_URL` from `.env.local`

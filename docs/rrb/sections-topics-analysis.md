# RRB NTPC Sections & Topics Analysis

## Overview
This document analyzes the RRB NTPC syllabus structure to create a hierarchical database structure with Sections and Topics.

## Database Schema

### Sections Table
- `id`: UUID (Primary Key)
- `name`: Text (Section name)
- `description`: Text (Section description)
- `display_order`: Integer (For ordering)
- `exam_type`: Enum ('RRB_NTPC', 'SSC_CGL', 'BANK_PO', 'OTHER')
- `created_at`: Timestamp

### Topics Table
- `id`: UUID (Primary Key)
- `name`: Text (Topic name)
- `section_id`: UUID (Foreign Key to Sections)
- `description`: Text (Topic description)
- `created_at`: Timestamp

## Proposed Structure for RRB NTPC

### Section 1: Mathematics
**Description**: Mathematical and Arithmetic Ability covering numerical calculations, algebra, geometry, and data interpretation.

**Display Order**: 1

**Topics** (15 topics):
1. Number System - Basic number theory, divisibility, prime numbers
2. Decimals - Decimal operations and conversions
3. Fractions - Fraction operations and simplifications
4. LCM & HCF - Least Common Multiple and Highest Common Factor
5. Ratio and Proportion - Direct and inverse proportions
6. Percentage - Percentage calculations and applications
7. Mensuration - Area, volume, perimeter of geometric shapes
8. Time and Work - Work efficiency and time-based problems
9. Time and Distance - Speed, distance, and time calculations
10. Simple and Compound Interest - Interest calculations
11. Profit and Loss - Commercial mathematics
12. Elementary Algebra - Basic algebraic expressions and equations
13. Geometry and Trigonometry - Geometric theorems and trigonometric ratios
14. Elementary Statistics - Mean, median, mode, standard deviation
15. Data Interpretation - Charts, graphs, and table analysis

**Expected Weightage**: 30-35 questions (CBT 1), 35-40 questions (CBT 2)

---

### Section 2: General Intelligence & Reasoning
**Description**: Logical reasoning, analytical ability, and problem-solving skills covering various reasoning patterns.

**Display Order**: 2

**Topics** (16 topics):
1. Analogies - Pattern recognition and relationships
2. Number Series - Number sequence completion
3. Alphabet Series - Letter sequence completion
4. Coding and Decoding - Coding patterns and cipher techniques
5. Mathematical Operations - Symbol substitution and BODMAS
6. Similarities and Differences - Identifying odd one out
7. Blood Relations - Family relationship problems
8. Analytical Reasoning - Logical analysis and deduction
9. Syllogism - Logical statements and conclusions
10. Jumbling - Word and sentence rearrangement
11. Venn Diagrams - Set theory and logical grouping
12. Puzzles - Seating arrangements, floor puzzles, etc.
13. Data Sufficiency - Determining sufficiency of information
14. Statement and Conclusion - Logical inference
15. Decision Making - Choosing best course of action
16. Maps and Graph Interpretation - Direction sense and visual data

**Expected Weightage**: 30-35 questions (CBT 1), 35-40 questions (CBT 2)

---

### Section 3: General Awareness
**Description**: General Knowledge covering current affairs, science, history, geography, polity, economy, and culture.

**Display Order**: 3

**Topics** (21 topics):
1. Current Affairs - National and international events
2. Games and Sports - Sports personalities, tournaments, awards
3. Art and Culture - Indian art, music, dance, literature
4. Indian Literature - Authors, books, literary works
5. Monuments and Places - Historical places and landmarks
6. General Science - Physics, Chemistry, Biology (up to 10th standard)
7. History of India - Ancient, medieval, and modern history
8. Freedom Struggle - Independence movement and leaders
9. Physical Geography - Landforms, climate, natural resources
10. Social Geography - Population, migration, settlements
11. Economic Geography - Industries, agriculture, trade
12. Indian Polity - Constitution, governance, political system
13. Scientific Developments - Space, nuclear, and technology
14. UN and World Organizations - International bodies and treaties
15. Environmental Issues - Climate change, conservation, ecology
16. Computer Basics - Hardware, software, internet, MS Office
17. Abbreviations - Common acronyms and short forms
18. Transport Systems - Railways, roadways, airways in India
19. Indian Economy - Banking, finance, budget, economic policies
20. Famous Personalities - Notable figures in various fields
21. Government Programs - Flagship schemes and initiatives

**Expected Weightage**: 40 questions (CBT 1), 40-45 questions (CBT 2)

---

## High-Priority Topics (Based on Weightage)

### Mathematics (High Weightage: 3-5 questions each)
- Number System
- Ratio and Proportion
- Percentage
- Simple and Compound Interest
- Profit and Loss

### Reasoning (High Weightage: 3-5 questions each)
- Analogies
- Coding and Decoding
- Analytical Reasoning
- Puzzles

### General Awareness (High Weightage: 7-15 questions)
- **Current Affairs** (10-15 questions) - HIGHEST
- **General Science** (7-10 questions) - SECOND HIGHEST
- History of India (5-8 questions)
- Static GK (5-9 questions)

## Data Migration Strategy

### Step 1: Check Existing Data
- Query current sections in database
- Query current topics in database
- Identify what needs to be created vs updated

### Step 2: Insert/Update Sections
- Insert 3 main sections if they don't exist
- Update descriptions and display order if they exist
- Use `ON CONFLICT` clause for upsert

### Step 3: Insert/Update Topics
- Insert 52 total topics (15 + 16 + 21)
- Link each topic to its parent section
- Update descriptions if topics already exist
- Use section name to find section_id

### Step 4: Verification
- Count total sections (expected: 3)
- Count total topics (expected: 52)
- Count topics per section
- Display summary report

## Seed Script Features

1. **Idempotent**: Can run multiple times without duplicating data
2. **Update-safe**: Updates existing records instead of failing
3. **Verification**: Shows before/after state
4. **Detailed logging**: Shows what's being inserted/updated
5. **Error handling**: Proper error messages and rollback

## Summary

- **Total Sections**: 3
- **Total Topics**: 52 (15 + 16 + 21)
- **Exam Type**: RRB_NTPC
- **All data properly structured for database insertion**

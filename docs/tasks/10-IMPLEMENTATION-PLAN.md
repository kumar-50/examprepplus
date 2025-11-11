# Task 10: Test Builder - Complete Implementation Plan

## Summary of Analysis

### ✅ Existing Database Tables
- `questions` - Has basic fields but **MISSING verification columns**
- `tests` - Complete
- `test_questions` - Complete (junction table)
- `sections` - Complete
- `topics` - Complete
- `users` - Complete

### ❌ Missing Database Columns in `questions` Table
1. `status` - ENUM: 'pending' | 'approved' | 'rejected'
2. `is_verified` - BOOLEAN (default false)
3. `verified_by` - UUID (FK to users)
4. `verified_at` - TIMESTAMP

---

## Implementation Plan (End-to-End)

### **Phase 1: Database Schema Updates** ⚠️ CRITICAL FIRST

#### 1.1 Update Questions Schema
**File:** `src/db/schema/questions.ts`

**Actions:**
- Add `questionStatusEnum` with values: 'pending', 'approved', 'rejected'
- Add `status` column (default: 'pending')
- Add `isVerified` column (default: false)
- Add `verifiedBy` column (FK to users, nullable)
- Add `verifiedAt` column (nullable timestamp)

**Estimated Time:** 15 minutes

---

#### 1.2 Create & Apply Migration
**Files:** 
- `drizzle/migrations/XXXX_add_question_verification.sql`
- Run: `npm run db:push` or `npm run db:migrate`

**Migration SQL:**
```sql
-- Add enum for question status
CREATE TYPE question_status AS ENUM ('pending', 'approved', 'rejected');

-- Add new columns to questions table
ALTER TABLE questions 
ADD COLUMN status question_status DEFAULT 'pending' NOT NULL,
ADD COLUMN is_verified BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN verified_at TIMESTAMP;

-- Create index for performance
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_is_verified ON questions(is_verified);

-- Set existing questions to approved (migration safety)
UPDATE questions SET status = 'approved', is_verified = true WHERE is_active = true;
```

**Estimated Time:** 20 minutes

---

### **Phase 2: Backend API Routes**

#### 2.1 Question Verification API
**File:** `src/app/api/admin/questions/verify/route.ts`

**Endpoints:**
- `GET /api/admin/questions/verify` - List questions by status (pending/approved/rejected)
- `PATCH /api/admin/questions/verify/[id]` - Approve/reject single question
- `POST /api/admin/questions/verify/bulk` - Bulk approve questions

**Features:**
- Filter by status
- Pagination support
- Admin authentication check
- Update verification metadata

**Estimated Time:** 45 minutes

---

#### 2.2 Test Management API
**File:** `src/app/api/admin/tests/route.ts`

**Endpoints:**
- `GET /api/admin/tests` - List all tests
- `POST /api/admin/tests` - Create new test
- `GET /api/admin/tests/[id]` - Get test details
- `PATCH /api/admin/tests/[id]` - Update test
- `DELETE /api/admin/tests/[id]` - Delete test

**Estimated Time:** 1 hour

---

#### 2.3 Test Questions API
**File:** `src/app/api/admin/tests/[id]/questions/route.ts`

**Endpoints:**
- `GET /api/admin/tests/[id]/questions` - Get test questions
- `POST /api/admin/tests/[id]/questions` - Add questions to test (bulk)
- `PATCH /api/admin/tests/[id]/questions/reorder` - Reorder questions
- `DELETE /api/admin/tests/[id]/questions/[questionId]` - Remove question from test

**Features:**
- Only fetch approved questions for picker
- Batch insert for performance
- Handle ordering logic

**Estimated Time:** 1 hour

---

#### 2.4 Approved Questions API (for picker)
**File:** `src/app/api/admin/questions/approved/route.ts`

**Endpoints:**
- `GET /api/admin/questions/approved` - Get all approved questions
  - Query params: sectionId, topicId, difficultyLevel, search
  - Returns: Only questions with status='approved' AND is_verified=true

**Estimated Time:** 30 minutes

---

### **Phase 3: Admin UI Components**

#### 3.1 Question Review Page
**File:** `src/app/admin/questions/pending/page.tsx`

**Features:**
- Tabs: Pending | Approved | Rejected | All
- Question card display with all details
- Approve/Reject buttons
- Bulk selection checkbox
- Filter by section/topic/difficulty
- Pagination
- Search functionality

**Components Needed:**
- `QuestionReviewCard` - Display single question
- `QuestionFilters` - Filter controls
- `BulkActionBar` - Bulk approve/reject

**Estimated Time:** 2 hours

---

#### 3.2 Test Builder Page
**File:** `src/app/admin/tests/builder/page.tsx`

**Features:**
- Create/Edit test form
  - Title, description
  - Test type (mock/live/sectional/practice)
  - Duration (minutes)
  - Total marks
  - Negative marking toggle + value
  - Is free toggle
  - Is published toggle
  - Scheduled date (for live tests)
  - Instructions (rich text)
  
- Question Picker Modal
  - Filter by section/topic/difficulty
  - Search questions
  - Multi-select with checkboxes
  - Shows only approved questions
  - Display question count
  
- Selected Questions List
  - Drag-and-drop reordering
  - Set marks per question
  - Assign section
  - Remove button
  
- Test Preview
  - Total questions
  - Total marks
  - Duration
  - Section-wise breakdown
  - Publish button

**Components Needed:**
- `TestForm` - Main form component
- `QuestionPickerModal` - Modal for selecting questions
- `QuestionItem` - Individual question in picker
- `SelectedQuestionsList` - Draggable list
- `TestPreview` - Summary view

**Estimated Time:** 4 hours

---

#### 3.3 Test List Page
**File:** `src/app/admin/tests/page.tsx`

**Features:**
- List all tests (table view)
- Columns: Title, Type, Questions, Duration, Status (Published/Draft), Created
- Actions: Edit, Delete, Clone, Preview
- Filter by type, published status
- Search by title
- Create New Test button

**Estimated Time:** 1.5 hours

---

### **Phase 4: Shared Components & Utilities**

#### 4.1 UI Components
**Files:**
- `src/components/ui/data-table.tsx` - Reusable data table (if not exists)
- `src/components/ui/badge.tsx` - Status badges
- `src/components/ui/tabs.tsx` - Tab navigation
- `src/components/admin/question-card.tsx` - Reusable question display
- `src/components/admin/test-card.tsx` - Test card component

**Estimated Time:** 1 hour

---

#### 4.2 Drag & Drop Library
**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Usage:** For question reordering in test builder

**Estimated Time:** 15 minutes

---

#### 4.3 Form Validation
**Installation (if needed):**
```bash
npm install zod react-hook-form @hookform/resolvers
```

**Files:**
- `src/lib/validations/test.ts` - Test form schema
- `src/lib/validations/question.ts` - Question validation

**Estimated Time:** 30 minutes

---

### **Phase 5: Testing & QA**

#### 5.1 Database Testing
- Verify migration ran successfully
- Check existing questions have correct status
- Test foreign key constraints

**Estimated Time:** 30 minutes

---

#### 5.2 API Testing
- Test all endpoints with Postman/Thunder Client
- Verify admin authentication
- Test error handling
- Check pagination

**Estimated Time:** 1 hour

---

#### 5.3 UI Testing
- Question approval flow (approve/reject/bulk)
- Test builder - create test with questions
- Test reordering
- Filter and search functionality
- Publish/unpublish tests
- Edge cases (no approved questions, etc.)

**Estimated Time:** 1.5 hours

---

### **Phase 6: Documentation & Polish**

#### 6.1 Update Documentation
- Update DATABASE_SCHEMA.md with new columns
- Create user guide for admins
- API documentation

**Estimated Time:** 30 minutes

---

#### 6.2 Code Review & Refactoring
- Clean up code
- Add comments
- Optimize queries
- Handle loading states
- Add proper error messages

**Estimated Time:** 1 hour

---

## Total Estimated Time: ~18-20 hours

---

## Implementation Order (Critical Path)

1. ✅ **Phase 1.1** - Update questions schema (MUST DO FIRST)
2. ✅ **Phase 1.2** - Create and apply migration (MUST DO SECOND)
3. **Phase 2.1** - Question verification API
4. **Phase 3.1** - Question review page (can test immediately)
5. **Phase 2.4** - Approved questions API (needed for test builder)
6. **Phase 2.2** - Test management API
7. **Phase 2.3** - Test questions API
8. **Phase 4.1** - Shared components
9. **Phase 4.2** - Drag & drop setup
10. **Phase 3.2** - Test builder page
11. **Phase 3.3** - Test list page
12. **Phase 5** - Testing
13. **Phase 6** - Documentation

---

## Key Technical Decisions

### 1. Question Status Flow
```
CSV Import → status='pending', is_verified=false
Admin Reviews → status='approved', is_verified=true, verified_by=admin_id
Test Builder → Only shows approved & verified questions
```

### 2. Negative Marking Storage
- Store as basis points (e.g., -25 = -0.25 marks)
- Division by 100 when displaying/calculating

### 3. Question Ordering
- Use `question_order` field in `test_questions` table
- Support drag-and-drop reordering
- Auto-increment when adding questions

### 4. Performance Optimizations
- Index on `status` and `is_verified` columns
- Paginate question lists
- Cache approved question count
- Use batch inserts for test questions

### 5. Security
- Admin-only routes protected by middleware
- Verify user role in API routes
- Validate all inputs with Zod schemas
- Use transactions for multi-table operations

---

## Risk Mitigation

### Risk 1: Data Loss During Migration
**Solution:** Backup database before migration, set existing active questions to approved

### Risk 2: Performance with Large Question Banks
**Solution:** Implement pagination, filtering, and search from the start

### Risk 3: Race Conditions in Bulk Operations
**Solution:** Use database transactions for bulk approve/test creation

### Risk 4: UX Complexity in Test Builder
**Solution:** Break into steps: Create Test → Add Questions → Preview → Publish

---

## Success Criteria

- ✅ All questions require approval before appearing in test builder
- ✅ Admin can approve/reject/bulk approve questions
- ✅ Admin can create tests with only approved questions
- ✅ Questions can be reordered in tests
- ✅ Tests can be published/unpublished
- ✅ Section-wise breakdown works correctly
- ✅ Negative marking configurable per test
- ✅ Live tests can be scheduled
- ✅ All operations are performant (< 2s response time)
- ✅ Zero data integrity issues

---

## Next Steps

Would you like me to:
1. Start with Phase 1 (Database Schema Updates)?
2. Review/modify this plan?
3. Generate all files in sequence?

**Recommendation:** Start with Phase 1 immediately, then proceed sequentially.

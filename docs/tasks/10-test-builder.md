# 10 Test Management

## 10.1 Question Verification & Approval

### Objective
Enable admin to review and approve/reject questions before they can be used in tests.

### Steps

1. Create admin question review page (`/admin/questions/pending`) showing all questions with status = 'pending'.
2. Display question details: text, options, correct answer, explanation, section, topic, difficulty.
3. Provide **Approve** and **Reject** buttons for each question.
4. On approve: update status = 'approved', is_verified = true, verified_by = admin.id, verified_at = now().
5. On reject: update status = 'rejected', optionally capture rejection reason.
6. Add filter tabs: Pending | Approved | Rejected | All.
7. Bulk approval option (select multiple, approve all).

### Acceptance Criteria

- Admin sees list of pending questions ordered by created_at DESC.
- Approve action sets status = 'approved', is_verified = true, records verifier details.
- Reject action sets status = 'rejected'.
- Only approved questions (status = 'approved' AND is_verified = true) are visible in test builder.
- Rejected questions cannot be added to tests.
- Admins can re-approve previously rejected questions.

### Best Practices

- Log verification actions (optional: use audit table for compliance).
- Provide quick preview without full page navigation (modal or side panel).
- Show creator name if question was uploaded by specific admin.

---

## 10.2 Test Builder

### Objective

Create tests and link ordered questions with metadata (duration, negative marking, free/premium). Ensure only **approved and verified** questions can be added to tests.

### Steps

1. Test creation form (title, description, type, marks, duration, negative_marking toggle, scheduledAt for live tests).
2. **Question picker filters only approved questions** (status = 'approved' AND is_verified = true).
3. Multi-select interface with ordering input or drag-and-drop.
4. Save links to `test_questions` with order field, marks per question, section assignment.
5. Publish toggle controlling visibility (`is_published`).
6. Preview test with question count breakdown by section.

### Prerequisite

Questions must be approved by admin (via 10.1 Question Verification) before appearing in question picker.

### Acceptance Criteria

- Question picker shows **only approved questions** (status = 'approved', is_verified = true).
- Published test appears in user listing quickly.
- Reordering persists correctly.
- Cannot add pending or rejected questions to tests.
- Test preview displays correct question count and section distribution.

### Best Practices

- Batch write linking rows; avoid per-question API calls.
- Cache approved question count to avoid recalculating on every picker open.
- Provide admin with clear indication if insufficient approved questions exist for test pattern.

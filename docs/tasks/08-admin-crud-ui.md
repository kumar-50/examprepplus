# 08 Admin CRUD UI

## Objective

Enable creation and management of sections, topics, and questions.

## Steps

1. Section list + create/edit modal.
2. Topic management filtered by section.
3. Question form (rich text prompt, options, correct answer selector, explanation field).
4. Paginated question table with filters (section/topic/difficulty).

## Acceptance Criteria

- Create/edit/delete operations persist and reflect instantly.
- Validation prevents empty question_text or missing correct_option.

## Best Practices

- Optimistic UI updates; rollback on failure.
- Reuse form components; isolate field validation logic.

# 09 CSV Import Flow

## Objective

Bulk import questions from existing `data/seed_questions.csv` safely.

## Steps

1. Upload component (drag & drop) limited to .csv.
2. Parse with streaming library (avoid freezing for large files).
3. Validate columns; compile error list (row + reason).
4. Show preview table; enable confirm import button only if zero errors.
5. Bulk insert in a transaction; show success count.

## Acceptance Criteria

- Invalid rows blocked; no partial insert if any errors.
- Performance: <5s import for 500 rows.

## Best Practices

- Debounce parsing; avoid storing full file text in state.
- Provide template download link.

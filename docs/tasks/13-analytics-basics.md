# 13 Analytics Basics

## Objective

Expose per-attempt summary and section/topic accuracy metrics.

## Steps

1. Query attempts & aggregate correct vs total per section/topic.
2. Derive accuracy percentage; store minimal derived cache if needed.
3. Display bar or progress components (shadcn progress) for top sections.
4. Attempt history list linking to review pages.

## Acceptance Criteria

- Accuracy numbers match manual calculation for sample attempt.
- No N+1 query issues.

## Best Practices

- Compute heavy aggregates server-side; client receives summarized payload.

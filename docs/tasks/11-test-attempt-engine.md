# 11 Test Attempt Engine

## Objective

Provide timed test experience with navigation palette, flagging, and submission.

## Steps

1. Load test + questions sequentially; prefetch next question.
2. Timer component (auto-submit on expiry).
3. Palette showing states (unanswered, answered, flagged).
4. Submit flow → compute score, store attempt + answers JSON.
5. Review page listing answers, correctness, explanations.

## Acceptance Criteria

- Attempt stored with accurate counts and duration.
- Review clearly marks correct vs user choice.

## Best Practices

- Keep test session state in Redux slice; persist on tab close (optional localStorage sync).

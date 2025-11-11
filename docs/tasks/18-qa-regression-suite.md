# 18 QA Regression Suite

## Objective

Define and execute acceptance test checklist before deployment.

## Steps

1. List all critical flows (auth, CRUD, test attempt, payment, gating, analytics display).
2. Create manual test script file.
3. Run through tests on staging build; capture issues.
4. Fix blockers; rerun until pass.

## Acceptance Criteria

- All P0 flows pass without critical defects.
- Known issues documented if deferred.

## Best Practices

- Keep test data minimal; reuse seed import only once.

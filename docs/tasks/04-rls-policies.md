# 04 Row Level Security Policies

## Objective

Protect user-specific data and ensure isolation for attempts and subscriptions.

## Steps

1. Enable RLS on tables: user_test_attempts, user_answers, subscriptions.
2. Policies:
   - SELECT/INSERT/UPDATE on attempts where `auth.uid() = user_id`.
   - SELECT answers only for owning user or admin role.
3. Add admin override condition using user metadata role flag.
4. Test with two separate accounts.

## Acceptance Criteria

- Non-owner cannot read another user's attempts.
- Admin can read all.

## Best Practices

- Start minimally permissive; avoid overly broad policies (e.g., USING true).

## Risks

- Misconfigured policies blocking app → Keep fallback SQL script ready.

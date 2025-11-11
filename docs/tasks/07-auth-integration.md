# 07 Authentication Integration

## Objective

Provide signup/login/logout flows with session awareness and admin role gating.

## Steps

1. Build auth forms using shadcn form + input components.
2. Add email/password with validation (min length, email format).
3. Persist session via Supabase client; create `useAuth` hook.
4. Protect admin routes with higher-order component or layout guard.
5. Show user avatar & dropdown for logout.

## Acceptance Criteria

- Successful signup leads to dashboard redirect.
- Admin route blocks non-admin users.

## Best Practices

- Avoid storing password client-side; rely on Supabase API only.
- Provide minimal error messaging (generic, not disclosing existence of emails).

# 02 Supabase Configuration

## Objective

Integrate Supabase client for auth and data access with environment-driven configuration.

## Steps

1. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Create `src/lib/supabase/browser.ts` for client (singleton pattern).
3. (Optional) Add server client helper for RLS-safe server actions.
4. Test signup + login via Supabase Auth (email/password) using temporary page.
5. Store user metadata retrieval in a hook (`useSessionUser`).

## Acceptance Criteria

- Can create a new user and retrieve session.
- Client not re-instantiated on hot reload (verified via console log count).

## Best Practices

- Never expose service role key to client.
- Use typed responses (`Database` types generated via Supabase CLI export later).

## Edge Cases

- Network failure: show retry toast.
- Expired session: auto refresh using Supabase built-in mechanism.

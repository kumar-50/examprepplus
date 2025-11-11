# 19 Deployment

## Objective

Deploy application to Vercel with correct environment configuration and verify production readiness.

## Steps

1. Set env vars in Vercel dashboard (Supabase + Razorpay keys).
2. Trigger build and monitor logs.
3. Run smoke tests on production URL.
4. Enable Supabase backups and review RLS policies.
5. Add uptime monitoring (optional).

## Acceptance Criteria

- Production site loads landing + dashboard.
- Payment sandbox works; no console errors.

## Best Practices

- Separate staging vs production projects to avoid data pollution.

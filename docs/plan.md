# ExamPrepPlus MVP Execution Plan

## 1. Goal & Scope

Deliver a production‑ready MVP of ExamPrepPlus (RRB NTPC + extensible for other gov exams) in 7 days using Next.js, Supabase, Redux Toolkit, Razorpay. Focus: core test lifecycle (create → attempt → analyze → subscribe/pay) plus production‑oriented landing experience and admin essentials. Existing seed data (no handcrafted demo data) will be leveraged from `data/seed_questions.csv`.

## 2. Success Criteria (MVP Exit)

- Users can register/login and see a personalized dashboard.
- Admin can create sections, topics, questions (manual + CSV) and assemble published tests.
- Users can attempt mock, sectional, and practice mode tests with timing, navigation palette, answer submission, review screen.
- Live test scaffold (scheduling + ranking placeholder) prepared (basic listing, join + post-result ranking placeholder). Full real-time features deferred.
- Basic analytics: per attempt summary + section/topic accuracy percentages.
- Subscriptions: at least one paid plan purchasable via Razorpay; coupon application works; subscription status gates premium tests.
- Deployment live on Vercel + Supabase with environment config, and smoke test passes for critical flows.

## 3. Constraints & Assumptions

- Team size assumed: 1–2 devs. If solo, keep scope strictly to P0 features.
- One shared Supabase project (SQL + Auth). RLS policies minimal (user row protection, attempts isolation).
- Styling: Tailwind + existing UI components only; avoid custom complex charts (use simple placeholders if needed).
- Analytics depth limited (no ML recommendations yet).

## 4. High-Level Architecture

- Frontend: Next.js App Router, server components for data fetch where possible, client components for interactive test engine.
- State: Redux Toolkit slices (auth, tests, questions, attempts, analytics, subscription).
- Data: Supabase tables per schema; edge functions optional (defer unless blocking).
- Payments: Razorpay order creation via Next.js route handler → verify → update subscription & coupon usage.

## 5. Feature Prioritization

P0 (Must Ship): Auth, Admin CRUD (sections/topics/questions/tests), Test Attempt (mock/sectional/practice), Landing page (marketing + conversion), Basic analytics (attempt summary + section accuracy), Subscription + payment, Coupons (apply), CSV question upload (using existing `data/seed_questions.csv`).
P1 (Nice if time Day 7): Live test scheduling & ranking placeholder, User profile editing, Bookmark list page, Dark mode toggle.
P2 (Post-MVP Backlog): Advanced analytics trends, Recommendation engine, Video solutions, Forums, Mobile app, Referral program.

## 6. Detailed Daily Plan

Day 1 – Foundation + Landing Skeleton

- Setup Next.js project, Tailwind, linting, folder skeleton, Supabase client util.
- Define DB schema & run migrations (users extension fields, sections, topics, questions, tests, test_questions, attempts, answers, subscriptions, coupons, analytics).
- Implement basic RLS (user_test_attempts row ownership).
- Landing page scaffold: route, layout, hero component placeholder, brand color tokens.
  Acceptance: All tables exist; app boots locally; can sign up via Supabase; landing page route renders hero skeleton with CTA button.

Day 2 – Auth, Landing Content & Dashboard

- Auth integration (email/password) + session persistence.
- Role flag (admin) stored on user metadata; simple gate for admin routes.
- Dashboard: list available tests (mock/sectional), subscription status, quick stats placeholder.
- Expand landing: marketing copy sections (Problems solved, Features grid, CTA, Pricing teaser referencing subscription plans), basic responsive design.
  Acceptance: Login/logout works; unauthorized hits to /admin redirect; dashboard loads tests from DB; landing shows feature grid + pricing teaser sections responsive on mobile.

Day 3 – Admin Content CRUD

- UI forms for sections/topics (create/edit/delete, ordering).
- Question creation form + CSV upload parser (validate columns, preview, bulk insert).
- Image upload (use Supabase storage bucket).
  Acceptance: Admin can add ≥1 section, topic, 10 questions manually + 20 via CSV.

Day 4 – Test Builder

- Create test form: title, description, type, total_questions, duration, negative_marking, section distribution.
- Attach questions to test (ordered) – drag/drop or simple ordering numbers.
- Publish toggle (is_published + is_free).
  Acceptance: Can create a test with ≥30 linked questions and mark as published; appears in user listing.

Day 5 – User Test Engine

- Attempt flow: instructions → start → timer → question palette (answered, flagged) → submit.
- Practice mode (no timer, immediate explanation after answer).
- Submission → compute score, store answers JSON + section/topic breakdown.
- Review screen (answered, correct, explanation).
  Acceptance: Full attempt lifecycle persists; review shows correct vs user answers; negative marking applied.

Day 6 – Analytics + Payments

- Basic analytics: aggregate accuracy per section/topic from attempts; display charts (placeholder bars).
- Subscription plans table + purchase flow (Razorpay order create, verify signature, update subscription_status).
- Coupon validation (check expiry, usage limits, apply discount to amount before Razorpay order).
  Acceptance: User upgrades plan; premium test locked before purchase, unlocked after; analytics shows at least two metrics.

Day 7 – Polish & Deployment (No Demo Data Creation)

- Final landing refinement: performance (image optimization), meta tags (SEO), OG image, pricing call-to-action buttons wired to signup/upgrade.
- QA regression: run scripted test cases across flows.
- Deploy Vercel (env vars), final Supabase checks. Import existing seed question CSV only if fresh environment (no synthetic demo creation beyond current CSV).
- Add README quick start + backlog.
  Acceptance: Live URL accessible; smoke test passes; landing has basic SEO metadata; documented run instructions; no extraneous demo data added.

## 7. Task Breakdown by Area

Auth

- Supabase client wrapper, session hook, protected route component.
  Admin
- CRUD pages: /admin/sections, /admin/topics, /admin/questions, /admin/tests.
  Question Import
- CSV parse (FileReader) → map columns → validation (required fields) → bulk insert.
  Test Engine
- Slices: testSession (currentQuestion, answers[], flagged[], startTime), thunks: fetchTest, submitAttempt.
  Analytics
- Server queries: accuracy per section/topic from attempts; simple transformation → chart component.
  Payments
- Route POST /api/payment/order (planId, coupon?) → create Razorpay order.
- Route POST /api/payment/verify → signature check → update subscription & coupon usage.
  Subscriptions
- Middleware/guard: block premium tests if no active subscription.

## 8. Data Contracts (Samples)

TestAttempt Submit Input:

```
{
  testId: string,
  answers: [{ questionId: string, selectedOption: number, timeSpent: number, flagged: boolean }],
  startedAt: string,
  endedAt: string
}
```

TestAttempt Stored Output:

```
{
  id,
  test_id,
  user_id,
  score,
  correct_count,
  wrong_count,
  section_breakdown: { [sectionId]: { attempted, correct, accuracy } },
  answers_json,
  duration_seconds
}
```

Payment Verification Input:

```
{ orderId, razorpayPaymentId, razorpaySignature }
```

## 9. Edge Cases & Handling

- CSV malformed: show row-level error list; no partial inserts unless all pass.
- Duplicate question linking: prevent by unique constraint (test_id + question_id).
- Payment failure: mark attempt; user subscription unchanged; show retry banner.
- Timer expiry: auto-submit answers with unanswered marked null.
- Negative marking: ensure never drops below zero for a question; accumulate final score floor at 0 (business rule assumption).

## 10. Risks & Mitigation

| Risk                           | Impact               | Mitigation                                                    |
| ------------------------------ | -------------------- | ------------------------------------------------------------- |
| Time overrun on analytics      | Delays core delivery | Ship minimal counts first, enhance post-MVP                   |
| CSV bulk insert performance    | Large file freeze    | Limit rows per upload (e.g., 500) + chunking                  |
| Payment integration complexity | Blocks subscriptions | Implement sandbox early Day 6 morning                         |
| RLS misconfiguration           | Data leakage         | Start with permissive dev policies → tighten Day 7 with tests |
| State overcomplexity           | Debug difficulty     | Keep slices lean; derive computed stats in selectors          |

## 11. Observability & QA

- Console + Supabase logs (early). Add minimal error boundary.
- QA checklist script Day 7 (auth, CRUD, attempt, payment, analytics, gating).
- Use existing `data/seed_questions.csv` only for initial population (no handcrafted demo records beyond this). Document import procedure.

### Seed Data Usage Procedure

1. Administrator uploads `data/seed_questions.csv` via the CSV import UI.
2. System validates required columns (question_text, options, correct_option, section/topic references).
3. All valid rows inserted in a single transaction (rollback on any validation failure).
4. No partial manual edits required unless subsequent curation is desired.

## 12. Deployment Checklist

- Vercel project + env vars (SUPABASE_URL, SUPABASE_ANON_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC vars).
- Supabase: enable row backups; turn on email confirmations if needed.
- Test payment with sandbox keys; switch to live only after validation.

## 13. Post-MVP Backlog

- Real-time leaderboard for live tests.
- Adaptive difficulty mode.
- Recommendation engine (weak topics surfaced).
- Video explanations integration.
- Mobile React Native client.
- User referral & gamification.

## 14. Daily Standup Template (Optional)

Yesterday: <completed>
Today: <planned tasks>
Blockers: <issues>

## 15. Minimal README Addendum (To Generate Day 7)

- Install, env setup, migrations, dev start, deploy notes.

## 16. Acceptance Test Cases (Samples)

1. User Registration → Login → Dashboard loads tests list.
2. Admin creates Section, Topic, Question → Appears in test builder query.
3. Build Test (30 questions) → Publish → Visible to non-admin.
4. Attempt Test (submit mid-way) → Review screen shows accuracy.
5. Purchase Subscription → Premium test unlocked.
6. Apply valid coupon → Discount reflected in payable amount.
7. CSV Import (20 questions) → All inserted, duplicates skipped.

## 17. Metrics Baseline (Initial)

- Time per test attempt.
- Accuracy per section.
- Subscription conversion (manual check Day 7).

---

Prepared: 2025-11-08. Updated to reflect earlier landing page build and reliance on existing seed CSV (no new demo data authoring).

# ExamPrepPlus MVP Documentation

## Overview

ExamPrepPlus is a fast-moving exam preparation platform for RRB NTPC and other government exam aspirants. This MVP, deliverable within one week, uses Next.js, Supabase, Redux Toolkit, and Razorpay. The app supports mock and live tests, analytics, subscriptions, admin management, and rapid expansion.

---

## Architecture

### Tech Stack

| Layer      | Tool/Service         |
| ---------- | -------------------- |
| Frontend   | Next.js + React + TS |
| State Mgmt | Redux Toolkit        |
| Backend/DB | Supabase/PostgreSQL  |
| Payments   | Razorpay             |
| Styling    | Tailwind CSS         |
| Hosting    | Vercel, Supabase     |

---

## Database Schema

**users**

- Fields: id, full_name, email (unique), phone, avatar_url, subscription_status, subscription_id, created_at, updated_at
- Extends Supabase Auth

**questions**

- Fields: id, question_text, option_1-4, correct_option, explanation, section_id, topic_id, difficulty_level, has_equation, image_url, created_by, created_at, updated_at, is_active

**sections**

- Fields: id, name, description, display_order, exam_type, created_at

**topics**

- Fields: id, name, section_id, description, created_at

**tests**

- Fields: id, title, description, test_type, total_questions, marks, duration, negative_marking, is_published, is_free, instructions, test_pattern json, created_by, created_at, updated_at

**test_questions**

- Links each test to its questions with order, marks, section_id

**user_test_attempts**

- Tracks each test session1, score breakdown, timing, answers json

**user_answers**

- Per-attempt answers10, review flag, time spent

**subscriptions & subscription_plans**

- Manage plans, payments, and status

**coupons & coupon_usage**

- Discount codes, limits, history

**user_analytics**

- Per-user dashboard metrics by section and topic

---

## Feature List

### User Features

- Mock tests: Full-length, timed, instant scoring
- Sectional/Topic tests: Focused revision, analytics per area
- Live tests: Scheduled with ranking
- Practice mode: Question-by-question, review/bookmark, untimed
- Analytics: Performance graphs, trends, recommendations
- Subscriptions: Free tier, multiple paid plans, coupon support
- Profile & history: Settings, test/bookmark archive

### Admin Features

- Question creation: Form, CSV upload, editing, preview
- Section/topic CRUD: Add, edit, order sections/topics
- Test builder: Pattern config, section allocation, navigation/tabs settings
- User management: List, suspend, export
- Subscription and coupon management: Create/manage plans, activate/deactivate coupons, stats
- Bulk CSV upload and parse for rapid question entry

---

## MVP Week Plan

**Day 1**: Project scaffold, dependencies, repo structure, Supabase backend schema, RLS policies
**Day 2**: Authentication (Supabase), user dashboard, protected routing, admin role
**Day 3**: Admin question/section CRUD (form + CSV), rich text, image upload
**Day 4**: Admin test builder, section/tab config, question linking and test preview
**Day 5**: User test engine (mock/live/sectional), timer, palette, answer submission, review screen
**Day 6**: Analytics dashboard, Razorpay payments, subscriptions/coupons
**Day 7**: Landing page, feature highlights, full regression testing, deployment to Vercel and final launch

---

## Folder Structure

```
src/
  app/
    (auth, dashboard, admin, test, api)
  components/
    (ui, layout, test, analytics, admin)
  lib/
    supabase/, razorpay/, utils.ts
  store/
    index.ts, slices/
  types/, hooks/, utils/
public/
supabase/
  migrations/
.env.local
```

---

## Payment Integration

- Razorpay modal checkout for subscriptions
- API routes for order creation + payment verification
- Subscription table update upon success, coupon validation

---

## Redux Toolkit

- Store with auth, test, question, analytics slices
- Typed hooks
- Common asyncThunks for API/data fetching

---

## Testing & Deployment

- Vercel for frontend, Supabase Cloud for backend/db
- Test user/admin flows, payment, analytics
- Production .env + backups
- Google Analytics setup

---

## Next Steps & Expansion

- Mobile apps (React Native)
- Chat/forum support
- Video solutions, previous year papers
- Group study, referral programs

---

## References

- Next.js: nextjs.org/docs
- Supabase: supabase.com/docs
- Redux Toolkit: redux-toolkit.js.org
- Razorpay: razorpay.com/docs

---

This document serves as the foundational guide for ExamPrepPlus MVP implementation. Each phase and feature is referenced for quick developer onboarding, team planning, and future enhancements.

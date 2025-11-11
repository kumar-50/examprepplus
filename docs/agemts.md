# Engineering Agents & Best Practices Guide

## Purpose

Defines the standards every implementation task should follow: shadcn/ui conventions, Next.js App Router patterns, Tailwind usage, state management discipline, performance, accessibility, security.

## Shadcn/UI Best Practices

- Generate components via CLI; avoid manual edits inside generated primitives unless extending.
- Keep variant logic inside `class-variance-authority` (CVA) patterns; avoid ad-hoc class concatenation.
- Use composition over extending base components (wrap in feature component rather than modifying library internals).
- Co-locate component-specific types next to the component file.

## Next.js App Router Patterns

- Prefer Server Components for data-fetch/display (static/SSR) and Client Components only for interactivity/stateful UI.
- Route structure: semantic folders, collocate `loading.tsx`, `error.tsx` where UX requires feedback.
- Use `metadata` export for SEO on landing and marketing routes.
- Keep API routes thin: validation → service call → structured response.
- Avoid creating large monolithic client components; split into presentational + logic hooks.

## Tailwind CSS Guidelines

- Utility-first: avoid custom CSS unless pseudo-elements or complex states.
- Consistent spacing scale (`p-4`, `gap-6`)—prefer design tokens in config for colors and brand palette.
- Extract repetitive utility patterns into components or use `@apply` sparingly in a `globals.css` utilities section.
- Dark mode: configure class strategy early (`class` on `html`).

## State Management & Redux Toolkit

- Keep slices focused (auth, tests, attempts, analytics, subscription) with serializable state.
- Use RTK Query or server components for data fetching where possible; avoid duplicating cache.
- Derive UI state via selectors, not stored redundantly.
- Async thunks: always handle rejected state; provide user-facing error feedback.

## Data & Supabase

- Generate TypeScript types from Supabase schema (CLI) and import into code for strong typing.
- RLS policies minimal and audited pre-deploy; never expose service role key.
- Use stored procedures only if complex multi-step transactions required.

## End-to-End Type Safety

- Enable `"strict": true` plus `noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes` in `tsconfig.json` early.
- Maintain a single `Database` type generated from Supabase (`types/supabase.ts`); never hand-roll duplicate table interfaces.
- Define domain models (e.g. `TestAttempt`, `SubscriptionPlan`) in `src/types/domain/` that wrap DB rows + derived fields.
- Use Zod schemas at every boundary: forms, API routes, server actions. Export both `schema` and `type Schema = z.infer<typeof schema>` for reuse.
- Use discriminated unions for status-rich entities (e.g. payment: `{"status":"pending"|"success"|"failed"}`) instead of boolean pairs.
- Prefer `ReadonlyArray<T>` for returned collections that should not be mutated by consumers.
- Avoid `any`; if unsure, use `unknown` and narrow with schema parsing.
- Create a `Result<T, E>` utility type for service layer: `type Result<T,E> = { ok: true; data: T } | { ok: false; error: E }` to remove exception flow.
- Enforce API response wrappers: `{ data, error?: string }`—never return raw unvalidated DB rows directly to clients.
- For Redux slices, type initial state explicitly and avoid implicit `as` casting; prefer factory functions for complex defaults.
- Use generics in reusable hooks (`useFetch<T>()`) with runtime Zod validation to guarantee shape.
- Keep cross-layer contracts in `src/types/contracts/` (e.g., `TestAttemptSubmit`, `PaymentVerification`).
- Validate CSV import rows with a Zod schema row-by-row; accumulate typed error objects.

### Example: API Route Pattern

```ts
// src/app/api/attempt/submit/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAttempt } from '@/lib/services/attempts'

const submitSchema = z.object({
  testId: z.string().uuid(),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        selectedOption: z.number().int().min(1).max(4),
        timeSpent: z.number().int().min(0),
        flagged: z.boolean().optional().default(false),
      })
    )
    .min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
})

export async function POST(req: Request) {
  const json = await req.json()
  const parsed = submitSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_PAYLOAD', issues: parsed.error.issues },
      { status: 400 }
    )
  }
  const result = await createAttempt(parsed.data) // returns Result<AttemptRecord, 'DB_ERROR'|'NOT_FOUND'>
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ data: result.data })
}
```

### Example: CSV Row Schema

```ts
const csvQuestionSchema = z.object({
  question_text: z.string().min(5),
  option_1: z.string().min(1),
  option_2: z.string().min(1),
  option_3: z.string().min(1),
  option_4: z.string().min(1),
  correct_option: z.coerce.number().int().min(1).max(4),
  section_id: z.string().uuid(),
  topic_id: z.string().uuid().optional(),
})
```

### Runtime + Compile Alignment

- Never trust compile-time types alone for external input; always parse.
- After parsing, narrow values (e.g., scoring logic) assumes validated shapes—no redundant guards.
- Add ESLint rule `@typescript-eslint/no-misused-promises` to catch forgotten awaits in async handlers.

### Tooling

- Consider `typescript-eslint` recommended + `strict` config. Reject unused vars except those prefixed with `_`.
- Enable `eslint-plugin-simple-import-sort` for automatic import ordering (enforced as errors).
- Use `tsc --noEmit` in CI to enforce type correctness separate from build.
- **Import Ordering**: All imports must be automatically sorted using `eslint-plugin-simple-import-sort`. Run `npm run lint -- --fix` or `npx eslint . --fix` to auto-fix import order. This is enforced as an error, not a warning.
- **Code Formatting**: Prettier is configured with the following settings:
  - No semicolons (`semi: false`)
  - Single quotes (`singleQuote: true`)
  - 100 character line width (`printWidth: 100`)
  - ES5 trailing commas (`trailingComma: 'es5'`)
  - Arrow function parens avoided when possible (`arrowParens: 'avoid'`)
  - LF line endings (`endOfLine: 'lf'`)
- Run `npm run format` before committing to ensure consistent formatting across the codebase.
- Run `npm run typecheck` to verify TypeScript compilation without emitting files.
- **Quality Gate**: Run `npm run quality` to execute all three checks (lint, typecheck, format:check) in sequence. All checks must pass before considering a task complete.

### Testing Type Safety

- Add a minimal test verifying schema rejects malformed attempt payload (e.g., missing answers).
- Use `expectTypeOf` (vitest) or `tsd` for compile-time contract tests on domain types.

### Avoid

- Ambient type declarations that hide errors.
- Overuse of enums where literal unions suffice (prefer unions for better tree-shaking and flexibility).
- Casting server responses `as SomeType` without validation.

## Performance

- Code split heavy client components; lazy load non-critical (charts, test review extras).
- Preload critical fonts or use system fonts for faster FCP.
- Image optimization via `next/image`; specify widths and responsive sizes.
- Avoid blocking JS in landing route; minimal client components.

## Accessibility (A11y)

- All interactive elements keyboard navigable (focus rings preserved).
- Form inputs associated with labels (`aria-describedby` for errors).
- Color contrast adherence (WCAG AA) for text/buttons.
- Provide `aria-live` regions for async status updates (importing CSV, payment states).

## Security

- Validate all payloads server-side (Zod schemas recommended).
- Sanitize rich text inputs to prevent XSS if rendering explanations.
- Implement rate limiting for auth & payment routes (future enhancement).

## Error Handling

- Central toast/notification system for transient errors.
- Distinguish between retryable (network) and terminal (validation) errors.

## Logging & Observability

- Structured logs for key events (attempt submitted, payment verified) with minimal PII.
- Feature flags stored in env or lightweight config for future iteration.

## Testing Philosophy

- Focus on integration tests around critical flows; unit test pure utilities.
- Use manual QA checklist prior to deployment while automated tests ramp.

## Deployment & Release

- Staging environment mandatory for payment & gating verification.
- Version bump & changelog for significant MVP increments.

## Documentation Hygiene

- Each task file should end with Acceptance Criteria section.
- README links to deeper docs; avoid duplication.

## Agent Execution Rules

- Complete tasks sequentially; do not skip prerequisites.
- Validate after each major feature (run minimal smoke test).
- Keep changes small and review after each slice addition.

## Anti-Patterns to Avoid

- Storing large derived datasets in Redux (compute on demand).
- Mixing data fetching and presentation logic heavily.
- Uncontrolled side-effects in components (move to hooks).

---

This guide should be referenced before starting any task file to ensure consistency and quality.

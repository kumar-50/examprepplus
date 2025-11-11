# 01 Project Baseline Setup

## Objective

Confirm and refine the already scaffolded Next.js + TypeScript + Tailwind + shadcn UI setup (now using npm, not pnpm) and close remaining gaps: Prettier config, strict type hygiene, path aliases verification, utility helpers, and baseline quality tooling.

## Current State (Detected)

- Next.js app scaffolded (`next@15.5.6`, React 19).
- Tailwind present (globals at `src/app/globals.css`).
- ESLint flat config using `next/core-web-vitals` + TS.
- shadcn configured (`components.json` present) with multiple UI primitives already generated.
- Path alias `@/*` configured in `tsconfig.json`.
- Strict mode enabled in TS (`"strict": true`).

## Remaining Gaps

- Prettier config not present (unified formatting).
- Utility `cn` merge helper not confirmed.
- Consistent import/order lint rule set not added.
- No type-level exact optional property setting (consider enabling `exactOptionalPropertyTypes`).
- Missing script convenience: `npm run lint` should target project files (`eslint .`).
- Consider adding `typecheck` script running `tsc --noEmit`.

## Updated Prerequisites

- Node & npm installed
- Repository initialized (already satisfied)

## Steps (Refined)

1. Add Prettier: create `.prettierrc` (+ optional `.prettierignore`) with opinionated settings (semi: false, singleQuote: true, printWidth: 100).
2. Add `format` npm script: `"format": "prettier --write ."`.
3. Confirm `src/lib/utils.ts` contains `cn` helper using `clsx` + `tailwind-merge`; add if missing.
4. Add `npm run typecheck` script calling `tsc --noEmit`.
5. Extend TS config: add `exactOptionalPropertyTypes: true`, enable `noUncheckedIndexedAccess` (evaluate impact).
6. Add ESLint plugins (import/order) for consistent grouping (internal vs external).
7. Create minimal `.editorconfig` for cross-editor consistency.
8. Run `npm install --save-dev prettier eslint-plugin-import`.
9. Execute `npm run lint` and `npm run typecheck`; resolve any issues.
10. Smoke run: `npm run dev` and verify UI components render without hydration errors.

## Acceptance Criteria

- `npm run dev` boots without errors (no hydration mismatch warnings).
- Prettier formats files consistently (test on a component file).
- `npm run typecheck` exits clean (no TS errors).
- ESLint passes (no blocking errors) with import/order rules enforced.
- `cn` helper available and used in at least one component.

## Best Practices Notes

- Prefer functional components with explicit props typing.
- Use absolute imports via `tsconfig.json` paths later.
- Keep UI components stateless; container logic lives in app routes or feature hooks.

## Metrics

- Dev server cold start remains < 2s.
- Lint run completes < 5s on current codebase.

## Risks & Mitigation

- Formatting drift → Prettier enforced via script (optionally pre-commit hook later).
- Import chaos → Import/order plugin reduces merge conflicts.
- Stricter TS flags causing temporary build friction → Introduce incrementally (start with `exactOptionalPropertyTypes`; monitor).

## Follow-Up (Optional Enhancements)

- Add Husky + lint-staged for pre-commit quality gate.
- Introduce `ts-reset` or utility types only if needed (avoid premature complexity).
- Evaluate using `@total-typescript/ts-reset` only after profiling real pain points.

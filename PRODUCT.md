# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Kazakhstani secondary school students deciding on a career direction and a university major. They are early-stage explorers, not just final-year applicants — the product supports goals ranging from open exploration to picking a specific profession or university (see `ASSESSMENT_GOALS`: explore / profession / university).

## Product Purpose

Profy (by NewLevelHub) helps students figure out what career direction fits them and what it actually takes to get into a matching university program in Kazakhstan. It runs an adaptive assessment, produces a personalized career-direction result, and turns that into a concrete plan (gap analysis + roadmap) toward specific university programs. Success means a student leaves with a direction they trust and a clear next-step plan, not just a personality label.

## Positioning

Two things a generic career-quiz app could not truthfully copy:

1. The assessment itself is adaptive/branching (an "Akinator-style" engine — `AkinatorAssessmentView`), not a fixed-length static test. It draws on RIASEC, Big Five, and thinking-style models, plus a forced-choice pair/motivation flow, rather than a single questionnaire.
2. Results connect to reality: a direction result is followed by a **gap analysis** against real Kazakhstani university programs and a **roadmap**, not just a label. This is what makes the result actionable rather than descriptive.

## Operating Context

- Web SPA, built as a companion to the source-of-truth mobile app `profi-mobile` (React Native/Expo) — the web app mirrors its screens and page structure; new screens should generally track the mobile app's structure unless a page is explicitly web-only (e.g. `/admin`).
- Talks to the Profy backend at `profy.newlevelhub.kz` (dev proxies `/api/*` to `localhost:8000`).
- Core flows: auth → onboarding (profile + artifacts setup) → goal selection → adaptive assessment (+ pairs/motivation sub-flows) → praise/result loading → results (direction detail, university list, program detail, gap analysis) → roadmap. Admin area for user management sits alongside the main app.
- Interface language is Russian (all labels/copy in the codebase are Russian).

## Capabilities and Constraints

- Assessment models in use: RIASEC (6 types), Big Five personality traits, "thinking style" (creative/systematic/strategic/practical), plus forced-choice pair and motivation-triplet sub-assessments.
- University/program data is **Kazakhstan-only** (currently Алматы/Астана) — this is current product truth to preserve, not an oversight to "fix" toward international data.
- Program data intentionally has **no cost-per-year field and no ЕНТ-score field** — these were deliberately removed/never modeled; don't reintroduce them as if restoring a missing feature.
- The adaptive quiz has no fixed question count — don't design progress UI that implies a fixed total (e.g. "question N of M") unless the underlying flow actually has one (some sub-flows, like Subject Readiness, do have a fixed count; the main Akinator assessment does not).
- Auth/session via JWT (Zustand persisted store), 401 triggers logout.

## Brand Commitments

- Product name **Profy**, by **NewLevelHub**.
- Has a mascot system (`Mascot.tsx`) with a fixed taxonomy of career-category variants (it, ai, data, design, med, science, psy, business, finance, law, media, eng, marketing, eco, pm) — reuse existing kinds rather than inventing new ones.
- Violet/orange brand palette and typeface (Nunito) are set in `theme.css`, sourced from the mobile app's `themes.ts` — treat as inherited design system, not open for reinvention per-screen.

## Evidence on Hand

- Real, wired backend API (not mocked) for auth, profile, assessment, results, roadmap, universities.
- Mobile app `profi-mobile` (sibling repo) is the structural source of truth for screens/flows when in doubt about what a web page should contain.
- No testimonials, case studies, press, or pricing content exist in the repo — do not fabricate any.

## Product Principles

- Adaptivity over static forms: prefer branching/conditional flows that reflect the real assessment engine over fixed-step wizards, when the underlying data supports it.
- Actionable over descriptive: a result is only "done" when it connects to a concrete next step (university/program/roadmap), not just a trait summary.
- Mobile-parity by default: match `profi-mobile`'s screen structure and content unless a page is explicitly web-only; deviations from the mobile reference should be deliberate, not incidental.
- Kazakhstan-scoped honesty: never imply broader (international, cost, ЕНТ-score) data coverage than the product actually has.

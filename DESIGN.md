# Design system — "Тропа"

Profy's visual language, v2. One system for ages 6–18: **fog** is the canvas
the whole product sits on, **pine** is structure/action, **dawn** marks a
finding or current step, **lake** is data, **clay** is reserved for errors.

This document exists so new UI stays inside the system instead of drifting
toward generic "AI slop" defaults (soft gradients, blurred drop shadows,
random radii, ad-hoc font sizes, purple-on-white SaaS templates). The rules
below are already enforced in code — this is the write-up of *why*, so they
don't get "fixed" back toward defaults by someone who doesn't know the
reasoning.

Source of truth: [`src/styles/theme.css`](src/styles/theme.css) (tokens) and
[`src/shared/ui/`](src/shared/ui/) (components). If this doc and the code
disagree, the code wins — update this file.

## Color

Five colors, each with exactly one job. Don't introduce a sixth, and don't
repurpose one of these for something outside its lane.

| Token | Role | Notes |
|---|---|---|
| `--fog` | Page canvas | Everything sits on this. |
| `--pine` | Structure / action | Brand color, primary buttons, active nav. |
| `--dawn` | Finding / "aha" / current step | Accent — the one warm note in the palette. |
| `--lake` | Data | Charts, info states. |
| `--clay` | Errors only | Not warnings — see below. |

- **No dedicated warning color exists on purpose.** `--warning` is an alias
  for `--dawn`. Don't invent an amber/yellow — it would be a sixth color
  competing with dawn's "aha" meaning.
- `--clay` is reserved for genuine errors/limits. Don't use it for anything
  softer (empty states, disabled, etc.).
- Always reference the CSS variables (`var(--brand)`, `.text-danger`, …) or
  the Tailwind-compatible aliases in `theme.css`. Never hardcode a hex value
  in a component — if the palette shifts (light/dark), a hardcoded color
  won't.
- Light and dark mode are both fully defined in `theme.css` (`:root` /
  `.dark`) with the same five-role structure — dark mode is not an
  afterthought filter, it's a second calibration of the same tokens.

## Elevation: density and line, not blur

```css
--shadow-card:   none;
--shadow-pop:    0 0 0 1px var(--hairline);
--shadow-button: none;
```

Hierarchy comes from **density, line weight, and fill** — not drop shadows.
Elevated surfaces get a defined hairline edge (`--hairline`) instead of a
blurred shadow. This is the single biggest thing that separates this system
from generic AI-generated UI, which defaults to soft floating-card shadows
everywhere. Don't add `box-shadow` blur to a component to make it "pop" —
give it a hairline border or adjust fill instead.

## One radius

```css
--radius-sm: 8px;
--radius: 8px;
--radius-lg: 8px;
--radius-pill: 9999px;
```

The whole product uses **one radius** (8px), plus a pill radius for
badges/chips. Don't introduce a second corner radius for "bigger" surfaces —
that's a common tell of ungoverned/generated UI. If something needs to look
more prominent, change size, weight, or color — not roundness.

## Typography

Three families, each with one job:

| Family | Token | Used for |
|---|---|---|
| Instrument Sans | `--font-sans` / `--font-body` | Body copy, UI, anything a person reads as prose |
| Bricolage Grotesque | `--font-display` | Screen titles / brand moments only — **max 1–2 per screen** |
| IBM Plex Mono | `--font-mono` | Machine/system content: ids, dates, statuses, codes |

Bricolage Grotesque ships no Cyrillic glyphs — its fallback chain is the same
sans stack as `--font-sans`, not a serif, so Cyrillic headings degrade
gracefully instead of silently switching to a mismatched serif face.

**Always pick type through the role scale, not raw sizes.** Use
`<Heading>`, `<Text>`, `<Mono>` (`src/shared/ui/typography/`) in JSX. Only
fall back to the raw recipe strings in `typography/tokens.ts`
(`type.displayMd`, `type.bodyLg`, etc.) when a component can't wrap the node
(native `<option>`, third-party components, className merges).

Do **not** use the legacy aliases (`.text-h1`, `.text-title`, `.text-body`,
`.text-small`, …) in new code — they're remapped onto the role scale for
backward compatibility only. New code uses `text-display-*` / `text-body-*`
/ `text-caption` / `text-mono-*` or the components directly.

Named exceptions (don't "fix" these back to the standard scale — they're
deliberate, not oversights):
1. Spine step numerals — mono digits are the "spine of clarity" motif.
2. OTP cells — mono numerals at display-sm size (it's an input, not a heading).
3. Emoji / mascot / Likert-dot sizes — icon geometry, not type.
4. Likert pole labels — may clamp between caption and body-md so the scale
   stays readable beside the dots at every viewport.

## Motion

Standard transition tempo is **180ms**. Motion changes tempo to signal
weight, not technique — the same easing/transform vocabulary is reused
everywhere, only the duration and context change:

- Button/tap feedback: instant, `transform: scale(0.97)` on `:active` (`.press-scale`).
- Field validation errors: 170ms, subtle — this fires often while a form is
  being filled in, so it stays in the "standard" tier, not the "delight" tier.
- OTP digit fill: 140ms, a rare once-per-session action, so a little
  personality is fine (occasional-frequency tier).
- Likert selection check: 140ms with a bouncier easing — instant confirmation
  that a tap registered.
- Onboarding welcome step: 500ms opacity-only fade — the **one deliberate
  exception** to the 180ms tempo, because it's an address-shift moment
  (adult → child), not a routine content swap. Don't reuse this outside that
  screen, and don't average it back toward 180ms.

Rule of thumb: **rare + significant action → more personality is allowed;
frequent + routine action → stay subtle and fast.** Every animation must
respect `prefers-reduced-motion: reduce` (see existing `@media` blocks in
`theme.css` for the pattern — drop transforms, keep or drop opacity per
case).

### Mascot motion

The mascot sprite is a static PNG. By default only the eyes blink (white lid
`div`s over the eye boxes) and the whole sprite plays a one-shot landing on
mount (`.mascot-enter`, every mascot).

`<Mascot interactive />` adds more transform-only layers, each on its own
wrapper so nothing fights for the one `transform` slot (`theme.css`, driven by
`mascot/useMascotInteraction.ts`):

- `.mascot-lean` — a small drift toward the pointer while it's near;
- `.mascot-gesture` — a rare one-shot idle move on a randomised timer
  (`glance-left/right`, `perk`, `wiggle`), so the idle doesn't read as one
  looping animation. Skipped while the pointer is close (the lean already
  carries that);
- `.mascot-breath` — the always-on idle loop. Deliberately *not* a pure sine
  (off-centre peak + a hair of drift/roll) — don't "simplify" it back to a
  symmetric two-keyframe pulse;
- `.mascot-hop` — squash-and-stretch on tap.

`<Mascot celebrate />` is a separate one-shot bounce (`.mascot-cheer`) for the
genuine payoff pose — the `completion`/medal reveal after finishing the
assessment — per the "rare + significant → more personality" rule above.

All of it is fine-pointer only and off under reduced-motion. Turn `interactive`
on only for the rare/"significant" poses (`welcome`, `completion`, profile
hero) — never for the `transition`/`waiting` poses that recur on routine
screens, and never on the question screen (ТЗ 29.2). Anything richer than this
(independently moving ears/tail/limbs, pupil tracking) needs the art
re-exported in layers or a rigged format — not in scope here.

## Components

Reusable primitives live in `src/shared/ui/` (`Button`, `Badge`, `Card`,
`Input`, `Spinner`, `Skeleton`, `ProgressBar`, `PageContainer`, `PageHeader`,
`SectionHeading`, `Mascot`, `Tooltip`, …). Check there before building a new
one-off version of something that likely already exists — a second bespoke
card/button implementation is how a codebase drifts away from this system
screen by screen.

## Checklist before shipping new UI

- [ ] Colors come from `theme.css` variables/utilities — no hardcoded hex.
- [ ] No new border-radius value — reuse `--radius` or `--radius-pill`.
- [ ] No blurred drop shadow added for "elevation" — use a hairline border or fill/density instead.
- [ ] Headings use `--font-display`, body uses `--font-sans`/`--font-body` — not mixed.
- [ ] Type picked via `<Heading>/<Text>/<Mono>` or the role-scale classes — not a legacy alias, not an arbitrary `text-xl`/`font-bold` combo.
- [ ] At most 1–2 display headings per screen.
- [ ] New transitions default to 180ms unless there's a specific, documented reason (rarity + significance) to deviate.
- [ ] `prefers-reduced-motion` handled for any new animation.
- [ ] Checked `src/shared/ui/` for an existing component before writing a new card/button/input from scratch.

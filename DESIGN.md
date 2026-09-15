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
  afterthought filter, it's a second calibration of the same tokens. See
  "Dark mode" below for the six places where night behaves differently.
- Never use a raw palette token (`--midnight`, `--fog`, `--paper`) as a text
  or surface color in a component — reach for the role (`--text-heading`,
  `--bg-page`, `--bg-surface`). Raw tokens flip meaning between themes:
  `--midnight` is near-black in *both*, so a heading painted with it
  disappears at night.

## Dark mode

The night calibration keeps every relationship from the day one — surface
sits above canvas (1.15 vs 1.11), the hairline reads against the surface
(2.08 vs 1.85) — so the product feels like the same product, not its
negative. Six rules differ:

1. **Dawn swaps roles.** By day dawn can't carry text (2.44 on Fog — that's
   what `--dawn-deep` is for); at night it's the brightest thing on screen
   (8.23), so it must not fill large areas. Mark, edge, current-step numeral,
   the dot in the wordmark — nothing wider.
2. **The button turns inside out.** Day: pine fill, cream label. Night: light
   pine, near-black label (`--text-on-brand` #08110F, 7.09).
3. **There is no white.** Primary text at night is the same cream that serves
   as the day canvas (#EDE9DF). Pure `#fff` on the dark green rings and
   haloes the letterforms.
4. **Large brand planes don't lighten.** `--brand` is the interactive pine and
   *does* lighten at night so it reads as a control; a half-screen plane
   lightened the same way becomes a light source. Those surfaces (stats band,
   final CTA, the hero shape) use `--brand-solid` / `--on-brand-solid`, which
   stay deep in both themes.
5. **Scrims are a token, not `bg-black/40`.** `--scrim` is 45% by day and 66%
   at night, and the modal rises to `--bg-raised` instead of staying on the
   surface color.
6. **The mascot gets dimmed.** The sprites are drawn for a light canvas —
   white body, dark outline. At night `.mascot-sprite` drops to
   `brightness(0.93)` so the figure stays readable without glaring. No
   re-export of the art needed.

Print (`UsersPrintReport`, `AssessmentPrintReport`, `print.css`) is always
day and holds its colors as hex on purpose — it's paper. Don't "fix" it onto
tokens.

The theme itself lives in `shared/lib/theme.ts` (three states: system /
light / dark, class `dark` on `<html>`), is applied before first paint by the
inline script in `index.html`, and is switched by `<ThemeToggle>` in the app
header, the landing header and the auth screens.

`<ThemeToggle>` deliberately shows **two** buttons for those three states.
Until the toggle is touched the product silently follows the device, and the
button that's highlighted is the theme currently in effect; the first click
pins the choice and detaches the product from the OS setting. The usual third
"system" button (a monitor glyph) is a system-settings convention that says
nothing to a 6–18 audience — the cost of dropping it is that there's no way
back to "follow the system" from the UI.

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
| Onest | `--font-sans` / `--font-body` / `--font-display` | Body, UI, kickers, and screen titles |
| IBM Plex Mono | `--font-mono` | Machine/system content: ids, dates, codes, spine numerals |

**Every family here ships Cyrillic, and that is the requirement, not a
preference.** The previous pair (Instrument Sans + Bricolage Grotesque) had
no Cyrillic at all, so the entire Russian interface was rendered by whatever
sans the OS supplied — the type system existed only for Latin text. Don't
introduce a face without checking its subsets first.

Display and body share **Onest**. Separate display faces (Unbounded, then
Geologica) read as poster-bold on Cyrillic headlines like «Ты уже в пути».
Hierarchy comes from size, weight (`font-semibold` via `<Heading>`), and
tight tracking — not a second family. Landing brand moments may still use
`font-bold` explicitly. Status kickers (`type.monoLabel` / `.journey-kicker`)
are Onest uppercase with a dawn hairline — not mono. Mono stays for true
machine content (spine digits, OTP, codes).

Journey surfaces and the app canvas use a quiet **veil**, not a colour mesh:
lighter paper fading in from above, a whisper of pine at the edges (opacity
only), plus a soft grain. No sky/glow/iris washes on the page — those tokens
remain available for small accent wells, not the canvas.

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
- [ ] Checked in **both themes** — not just the one you're working in.
- [ ] Text/surface colors use a role token, never a raw palette one (`--midnight`, `--paper`, …).
- [ ] No new border-radius value — reuse `--radius` or `--radius-pill`.
- [ ] No blurred drop shadow added for "elevation" — use a hairline border or fill/density instead.
- [ ] Headings use `--font-display`, body uses `--font-sans`/`--font-body` — not mixed.
- [ ] Type picked via `<Heading>/<Text>/<Mono>` or the role-scale classes — not a legacy alias, not an arbitrary `text-xl`/`font-bold` combo.
- [ ] At most 1–2 display headings per screen.
- [ ] New transitions default to 180ms unless there's a specific, documented reason (rarity + significance) to deviate.
- [ ] `prefers-reduced-motion` handled for any new animation.
- [ ] Checked `src/shared/ui/` for an existing component before writing a new card/button/input from scratch.

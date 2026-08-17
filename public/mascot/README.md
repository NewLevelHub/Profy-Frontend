# Mascot assets — pending

This folder is the drop-in location for the mascot artwork used by
`src/shared/ui/Mascot.tsx`. The component and its geometry (eye positions,
head centers) are already ported from the approved design reference and are
100% wired — only the PNG files themselves are missing.

Until real art is dropped in, `<img>` tags will 404 in dev/prod. That's
expected and intentional (no placeholder/AI-generated art has been
substituted) — it's the correct signal that final assets are still pending.

## Expected files (26 total)

### State sprites — `public/mascot/` (6 files, ТЗ 14.3, the states actually used by the product)

- `mascot-v2-greeting.png` — `welcome`
- `mascot-v2-notepad.png` — `transition`
- `mascot-v2-glass.png` — `rest`
- `mascot-v2-medal.png` — `completion`
- `mascot-v2-book.png` — `waiting`
- `mascot-v2-pause.png` — `pause`

### Profession sprites — `public/mascot/pro/` (20 files, unused pool held for later)

- `pro/doctor.png`
- `pro/engineer.png`
- `pro/developer.png`
- `pro/chemist.png`
- `pro/artist.png`
- `pro/musician.png`
- `pro/chef.png`
- `pro/architect.png`
- `pro/footballer.png`
- `pro/pilot.png`
- `pro/photographer.png`
- `pro/lawyer.png`
- `pro/vet.png`
- `pro/gardener.png`
- `pro/actor.png`
- `pro/journalist.png`
- `pro/gamer.png`
- `pro/baker.png`
- `pro/astronomer.png`
- `pro/entrepreneur.png`

All filenames must match exactly (case-sensitive) — they're referenced
literally from `src/shared/ui/mascot/sprites.ts`. No other sizes/formats are
read; if the source art ships as SVG or a different raster format, either
export PNGs at these exact names or update `sprites.ts` accordingly.

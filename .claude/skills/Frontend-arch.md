---
description: Enforces Profy frontend architecture, best practices, and project conventions. Invoke before implementing any feature or component to load all rules into context.
---

You are working on **Profy-Frontend** — a Vite + React 18 SPA for AI-powered career guidance. Apply the following architecture rules and conventions to every task in this project.

---

## Stack

React 18.3.1 · Vite 6.3.5 · TypeScript (strict) · React Router 7.13.0 · TanStack React Query 5.96.1 · Zustand 5.0.12 · Tailwind CSS 4.1.12 · Axios 1.14.0 · Lucide React 0.487.0 · clsx + tailwind-merge

> Tailwind is configured via `@tailwindcss/vite` plugin — NOT PostCSS.

---

## Project Structure

```
src/
  app/           — App.tsx, router.tsx
  pages/         — auth/ · onboarding/ · assessment/ · home/ · results/ · profile/ · roadmap/ · errors/
  shared/
    api/         — client.ts (Axios instance), endpoints.ts (API const)
    config/      — app-wide constants
    guards/      — RequireAuth, RequireGuest
    hooks/       — useAuth.ts and shared hooks
    lib/         — cn.ts
    store/       — auth.ts · profile.ts · assessment.ts · result.ts
    types/       — index.ts (all shared interfaces)
    ui/          — shared components, layouts
```

---

## Non-Negotiable Conventions

1. **Path alias:** Always `@/` — never relative `../../` paths
2. **API endpoints:** Always `API` from `@/shared/api/endpoints.ts` — never hardcode strings
3. **Types:** Always `@/shared/types/index.ts` — never duplicate interfaces
4. **Classnames:** Always `cn()` from `@/shared/lib/cn.ts` for conditional classes
5. **Server state:** `useQuery` / `useMutation` from TanStack React Query — only inside hooks
6. **Client state:** Zustand stores in `@/shared/store/` — never local state for persisted data
7. **API client:** Axios instance from `@/shared/api/client.ts` — never raw fetch
8. **Auth state:** `useAuthStore` from `@/shared/store/auth.ts`
9. **Layouts:** Defined in `router.tsx` — never inside page components
10. **Icons:** Lucide React — never inline SVG unless unavoidable

---

## Feature Architecture

### Folder layout for every non-trivial feature:
```
FeaturePage.tsx     — layout + slot assembly only
components/         — atomic UI pieces
sections/           — large composite blocks (optional)
hooks/              — all data fetching and business logic
utils/              — pure helpers (formatting, derivations)
```

### Page = Assembly Only
No `useQuery`, `useMutation`, or business logic in page components:
```tsx
export default function FeaturePage() {
  const { rows, isLoading, handlers } = useFeature();
  return (
    <main>
      {isLoading ? <FeatureSkeleton /> : rows.length === 0
        ? <FeatureEmptyState />
        : <ul>{rows.map(item => <FeatureItem key={item.id} item={item} {...handlers} />)}</ul>
      }
    </main>
  );
}
```

### Hooks = Logic Layer
- `useXxx.ts` — query, mutations, derived state, handlers → returns flat object
- `useXxxSettings.ts` — settings query + patch (if needed)
- Never call `useQuery` / `useMutation` directly in a page component

### Atomic Components (build for every list/form feature)
| Component | Purpose |
|-----------|---------|
| `XxxItem` | Single entity card/row — wrap with `React.memo` |
| `XxxSkeleton` | Animated loading placeholder |
| `XxxEmptyState` | Empty list placeholder |
| `XxxFilters` | Filter/search bar (if applicable) |

---

## Performance Rules

- `React.memo` on every list-item component
- `useMemo` for filter/sort — never recompute inline in JSX
- `queryKey` arrays must match exactly between `useQuery` and `invalidateQueries`
- Skeleton > spinner > raw text for loading states

---

## File Size Rules

- Page > ~80 lines → split into components + hook
- Form < ~120 lines → keep in one file
- Component used once and < ~40 lines → inline is fine
- Extract only when complexity or reuse justifies it

---

## Domain Reference

**User flows:** auth → onboarding (profile + artifacts) → assessment → results → roadmap → university/program → gap analysis

**Assessment goals:** `explore` | `profession` | `university` (university = senior only)

**Age groups:** `junior` | `middle` | `senior`

**Artifact types:** `hobby` · `club` · `sport` · `achievement` · `goal` · `book` · `game` · `topic` · `profession` · `university` · `dream`

**Routes:** `/login` `/register` `/verify-email` `/forgot-password` `/reset-password` `/welcome` `/onboarding/profile` `/onboarding/artifacts` `/assessment/goal` `/assessment` `/assessment/praise` `/assessment/loading` `/home` `/results` `/profile` `/profile/certificates` `/roadmap` `/results/directions/:slug` → universities → program → gap

---

## Pre-Task Checklist

Before writing any code:
- [ ] Check `@/shared/types/index.ts` — use existing interfaces, don't duplicate
- [ ] Check `@/shared/api/endpoints.ts` — use existing paths
- [ ] Check `@/shared/store/` — use existing stores before adding local state

## Pre-Finish Checklist

- [ ] `npm run typecheck` — zero errors
- [ ] All imports use `@/` alias
- [ ] No hardcoded API strings
- [ ] `cn()` used for all conditional classes
- [ ] Semantic HTML + ARIA where needed
- [ ] No unused imports or dead code

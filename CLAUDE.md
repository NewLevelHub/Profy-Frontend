# CLAUDE.md

## Localization rules (mandatory)

- The UI supports `ru` and `kk`; every user-facing string must be localized.
- Never add Russian or Kazakh UI copy directly in JSX/TS. Add a key to the matching `src/shared/i18n/locales/ru/*.json` and `kk/*.json`, then render it with `t(...)` or `<Trans>`.
- Keep the key structure and interpolation placeholders identical in `ru` and `kk`.
- Do not use Russian fallback text as the second argument to `t(...)` in product code; the catalog is the source of truth.
- Send the active locale through `Accept-Language` for API requests and use `format.ts` for locale-aware dates and numbers.
- Before finishing localization work, run `npm run i18n:check`, `npm run typecheck`, and `npm run lint`.

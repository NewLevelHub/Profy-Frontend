# Agent rules

The frontend supports Russian (`ru`) and Kazakh (`kk`). Treat all visible text, error messages, labels, placeholders, aria labels, confirmations, and toasts as localized content.

Add new strings to the matching JSON catalogs under `src/shared/i18n/locales/ru/` and `src/shared/i18n/locales/kk/`, with identical keys and interpolation variables. Use `t(...)`/`<Trans>` in code; do not hardcode Russian or Kazakh text or use a Russian fallback argument to `t`.

Keep `Accept-Language` propagation intact. Run `npm run i18n:check`, `npm run typecheck`, and `npm run lint` after changes.

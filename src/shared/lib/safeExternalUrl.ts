/**
 * An address that is safe to put into `<a href>`: an absolute http(s) URL, or
 * `undefined` when the value is anything else.
 *
 * React 18 renders whatever it is given, and a browser runs `javascript:…`
 * straight from a link — as script on our page, with access to the session
 * token. A university's site comes from the admin form and from imported
 * catalog data, so it goes through here before every `href`, whatever the
 * backend has already checked.
 */
export function safeExternalUrl(value?: string | null): string | undefined {
  try {
    const url = new URL(value ?? '');
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

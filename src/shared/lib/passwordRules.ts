/**
 * Client-side mirror of the backend password rule (min 8 chars, a letter and
 * a digit — `_validate_password_complexity`). Returns an `auth:` i18n key for
 * the first broken rule, or '' when the password is acceptable.
 */
export function passwordRuleErrorKey(password: string): string {
  if (password.length < 8) return 'auth:validation.passwordMin8';
  if (!/[A-Za-z]/.test(password)) return 'auth:validation.passwordNeedsLetter';
  if (!/\d/.test(password)) return 'auth:validation.passwordNeedsDigit';
  return '';
}

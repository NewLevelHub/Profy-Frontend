import axios from 'axios';
import type { TFunction } from 'i18next';
import { apiErrorCode } from '@/shared/api/client';

/** `error_code`s the invitation endpoints return — contract §2.3. */
const KNOWN_CODES = [
  'user_exists',
  'invitation_pending',
  'invitation_used',
  'invitation_revoked',
  'invitation_expired',
  'invitation_not_found',
  'invitation_email_undeliverable',
  'invitation_link_unavailable',
] as const;

/** One readable line for a failed invitation call. Branches on `error_code`,
 *  never on the server's `detail` text. */
export function invitationErrorMessage(error: unknown, t: TFunction<'admin'>): string {
  const code = apiErrorCode(error);
  if (code && (KNOWN_CODES as readonly string[]).includes(code)) return t(`invitations.errors.${code}`);
  if (axios.isAxiosError(error) && error.response?.status === 422) return t('invitations.errors.invalid');
  return t('invitations.errors.generic');
}

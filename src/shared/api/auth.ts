import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { InvitationPreview, TokenResponse, User } from '@/shared/types';

export const authApi = {
  me: () =>
    apiClient.get<User>(API.auth.me).then(r => r.data),

  register: (email: string, password: string) =>
    apiClient.post<{ message: string }>(API.auth.register, { email, password }),

  login: (email: string, password: string) =>
    apiClient.post<TokenResponse>(API.auth.login, { email, password }).then(r => r.data),

  googleLogin: (idToken: string) =>
    apiClient.post<TokenResponse>(API.auth.google, { id_token: idToken }).then(r => r.data),

  verifyEmailByCode: (email: string, code: string) =>
    apiClient.post<TokenResponse>(API.auth.verifyEmail, { email, code }).then(r => r.data),


  resendVerification: (email: string) =>
    apiClient.post(API.auth.resendVerification, { email }),

  forgotPassword: (email: string) =>
    apiClient.post(API.auth.forgotPassword, { email }),

  verifyResetCode: (email: string, code: string) =>
    apiClient.post(API.auth.verifyResetCode, { email, code }),

  resetPassword: (email: string, code: string, password: string) =>
    apiClient.post(API.auth.resetPassword, { email, code, new_password: password }),

  // POST with the token in the body: a token in the URL would be written to
  // the server's access logs, and it is the key to a staff account.
  getInvitation: (token: string) =>
    apiClient.post<InvitationPreview>(API.auth.invitationPreview, { token }).then(r => r.data),

  acceptInvitation: (token: string, password: string) =>
    apiClient.post<TokenResponse>(API.auth.acceptInvitation, { token, password }).then(r => r.data),
};

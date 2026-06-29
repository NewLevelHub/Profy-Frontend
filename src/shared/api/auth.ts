import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { TokenResponse, User } from '@/shared/types';

export const authApi = {
  me: () =>
    apiClient.get<User>(API.auth.me).then(r => r.data),

  register: (email: string, password: string) =>
    apiClient.post<{ message: string }>(API.auth.register, { email, password }),

  login: (email: string, password: string) =>
    apiClient.post<TokenResponse>(API.auth.login, { email, password }).then(r => r.data),

  verifyEmailByCode: (email: string, code: string) =>
    apiClient.post<TokenResponse>(API.auth.verifyEmail, { email, code }).then(r => r.data),

  verifyEmailByToken: (token: string) =>
    apiClient.post<TokenResponse>(API.auth.verifyEmail, { token }).then(r => r.data),

  resendVerification: (email: string) =>
    apiClient.post(API.auth.resendVerification, { email }),

  forgotPassword: (email: string) =>
    apiClient.post(API.auth.forgotPassword, { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post(API.auth.resetPassword, { token, password }),
};

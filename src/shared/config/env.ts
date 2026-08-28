export const env = {
  API_URL: import.meta.env.VITE_API_URL || '/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Profy',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export const env = {
  API_URL: import.meta.env.VITE_API_URL || '/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Profy',
  // Куда ведёт логотип на экранах входа. Локально лендинг лежит в public/,
  // в проде он обычно на корне домена — тогда достаточно поставить '/'.
  LANDING_URL: import.meta.env.VITE_LANDING_URL || '/landing/index.html',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

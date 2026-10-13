import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { i18nReady } from './shared/i18n';
import { initTheme } from './shared/lib/theme';
import { watchSessionAcrossTabs } from './shared/lib/sessionSync';
import './styles/index.css';

// До первой отрисовки класс `dark` уже проставил встроенный скрипт в
// index.html; здесь мы подхватываем тот же выбор в состояние приложения и
// подписываемся на смену системной темы.
initTheme();
// Sign-in/sign-out in another tab must reach this one (see sessionSync.ts).
watchSessionAcrossTabs();

// The active locale's catalog is a separate chunk (shared/i18n/index.ts);
// render once it is in, so no screen ever shows raw keys. If it fails to
// load, render anyway — keys on screen beat a blank page.
const render = () => createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
i18nReady.then(render, render);

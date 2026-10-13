import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { initTheme } from './shared/lib/theme';
import { watchSessionAcrossTabs } from './shared/lib/sessionSync';
import './styles/index.css';

// До первой отрисовки класс `dark` уже проставил встроенный скрипт в
// index.html; здесь мы подхватываем тот же выбор в состояние приложения и
// подписываемся на смену системной темы.
initTheme();
// Sign-in/sign-out in another tab must reach this one (see sessionSync.ts).
watchSessionAcrossTabs();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

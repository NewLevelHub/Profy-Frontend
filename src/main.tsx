import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { initTheme } from './shared/lib/theme';
import './styles/index.css';

// До первой отрисовки класс `dark` уже проставил встроенный скрипт в
// index.html; здесь мы подхватываем тот же выбор в состояние приложения и
// подписываемся на смену системной темы.
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

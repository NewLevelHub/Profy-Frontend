// Тема применяется до первой отрисовки: иначе на каждой загрузке тёмная тема
// моргала бы светлым кадром. Ключ и логика повторяют shared/lib/theme.ts —
// при правке менять оба места.
//
// Отдельный файл, а не <script> внутри index.html: Content-Security-Policy
// сайта (nginx/nginx.conf) не выполняет встроенные скрипты — в этом и состоит
// защита от внедрённого кода. Подключён обычным блокирующим <script src>.
(function () {
  try {
    var stored = localStorage.getItem('profy-theme');
    var choice = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var dark = choice === 'dark'
      || (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {
    /* приватный режим: остаёмся на светлой теме */
  }
})();

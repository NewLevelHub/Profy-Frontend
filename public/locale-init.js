// Каталог казахского языка — ленивый чанк (src/shared/i18n/index.ts): без
// этого скрипта он начинал грузиться только после старта приложения, и тот,
// кто выбрал казахский, ждал лишний сетевой круг на белом экране. Ключ и
// разбор повторяют readPersistedLocale (src/shared/store/locale.ts) — при
// правке менять оба места. Адрес чанка кладёт в <meta> сборка (vite.config).
//
// Отдельный файл, а не <script> внутри index.html: CSP не выполняет
// встроенные скрипты (см. theme-init.js).
(function () {
  try {
    var raw = localStorage.getItem('profy-locale');
    var state = raw ? JSON.parse(raw).state : null;
    if (!state || state.locale !== 'kk') return;
    var meta = document.querySelector('meta[name="profy-kk-catalog"]');
    if (!meta) return;
    var link = document.createElement('link');
    link.rel = 'modulepreload';
    link.crossOrigin = 'anonymous';
    link.href = meta.getAttribute('content');
    document.head.appendChild(link);
  } catch (e) {
    /* приватный режим: каталог загрузится обычным путём */
  }
})();

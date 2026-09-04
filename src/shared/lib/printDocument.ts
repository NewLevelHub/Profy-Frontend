/**
 * Печать через браузер — и почему не библиотека PDF.
 *
 * Отчёт целиком на русском: имена, названия шкал, формулировки вопросов.
 * jsPDF и pdfmake из коробки работают в WinAnsi — кириллицу они не печатают
 * вовсе, пока в бандл не вшить TTF с кириллицей в base64 (это сотни килобайт
 * на каждое начертание, ради экрана, который открывают несколько человек).
 * html2canvas растрирует страницу: текст в PDF перестаёт выделяться и искаться,
 * а качество зависит от devicePixelRatio.
 *
 * Печать браузера не имеет ни одной из этих проблем: те же шрифты продукта,
 * живой выделяемый текст, векторная графика, ноль зависимостей и ноль работы
 * на бэкенде. «Сохранить как PDF» — штатный пункт в диалоге печати и в macOS,
 * и в Windows, и в Chrome.
 *
 * Имя файла в диалоге печати браузер берёт из `document.title`, поэтому здесь
 * он подменяется на время печати и возвращается обратно.
 */
export function printWithTitle(title: string): Promise<void> {
  return new Promise((resolve) => {
    const previousTitle = document.title;
    document.title = title;

    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restore);
      resolve();
    };
    window.addEventListener('afterprint', restore);

    // Двойной rAF: первый кадр отдаёт браузеру только что вставленную разметку,
    // второй печатает уже посчитанный макет. Без этого Safari успевает вызвать
    // print() до layout и печатает пустую страницу.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        // Safari не всегда шлёт afterprint — страховка, чтобы заголовок
        // вкладки не остался подменённым навсегда.
        setTimeout(restore, 1000);
      });
    });
  });
}

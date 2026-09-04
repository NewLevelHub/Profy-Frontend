/** Triggers a browser download for an in-memory Blob (CSV/ZIP exports etc.) — no `<a href download>` possible for authenticated endpoints, since the request needs the Bearer header. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** UTF-8 byte order mark. */
const BOM = '﻿';

/**
 * Same download, but with a UTF-8 BOM in front of the CSV.
 *
 * Excel does not sniff UTF-8 in a `.csv`: without a BOM it decodes the file in
 * the system codepage, and every Cyrillic value in the export turns into
 * mojibake — «Бекзат» reads as «Ð‘ÐµÐºÐ·Ð°Ñ‚». The users export is full of
 * Cyrillic (profile names, and the goal/status columns once the backend
 * localises them), and Excel is exactly where an admin opens it.
 *
 * The backend sends the file without a BOM (`admin_export_service.users_to_csv`
 * returns a plain string). Prepending it here rather than asking for a backend
 * change keeps the endpoint's output clean for programmatic consumers — a BOM
 * is a nuisance for `csv.reader`/pandas — while the browser download, whose
 * only realistic destination is a spreadsheet, gets what a spreadsheet needs.
 */
export function downloadCsv(blob: Blob, filename: string) {
  downloadBlob(new Blob([BOM, blob], { type: 'text/csv;charset=utf-8' }), filename);
}

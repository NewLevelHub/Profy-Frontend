// Скриншот любого экрана приложения, включая те, что за авторизацией.
//
// Зачем: headless-хром в режиме `--screenshot` умеет открыть только публичный
// URL. Сессия живёт в localStorage ('profy-auth'), положить её туда снаружи
// нечем — поэтому онбординг, профиль и результаты снять было нельзя, и правки
// на этих экранах делались вслепую. Здесь браузер поднимается с отладочным
// портом и управляется по Chrome DevTools Protocol: скрипт логинится через
// API, кладёт токен, тему и локаль в localStorage нужного origin, и только
// потом открывает целевой адрес.
//
// Без зависимостей: fetch и WebSocket — глобальные начиная с Node 22.
//
//   node scripts/shot.mjs --path /onboarding/profile --out shot.png
//   node scripts/shot.mjs --path /profile --account qa-b --theme dark --full
//   node scripts/shot.mjs --path / --anon --w 1440 --h 1600
//
// Аккаунты локальной базы (см. память PRO-266): qa-b — заполненный профиль с
// готовым отчётом, qa-d — чистый, попадает в онбординг.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const APP = process.env.SHOT_APP ?? 'http://localhost:5173';
const API = process.env.SHOT_API ?? 'http://localhost/api/v1';
const PORT = Number(process.env.SHOT_PORT ?? 9333);

const ACCOUNTS = {
  'qa-a': 'qa-a@profy.kz',
  'qa-b': 'qa-b@profy.kz',
  'qa-c': 'qa-c@profy.kz',
  'qa-d': 'qa-d@profy.kz',
};
const PASSWORD = process.env.SHOT_PASSWORD ?? 'QaProfy2026';

// ─── аргументы ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const o = {
    path: '/', out: 'shot.png', account: 'qa-d', theme: 'light',
    locale: 'ru', w: 1440, h: 1000, wait: 2500, full: false, anon: false, do: '',
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--full') { o.full = true; continue; }
    if (a === '--anon') { o.anon = true; continue; }
    const key = a.replace(/^--/, '');
    if (key in o) o[key] = argv[++i];
  }
  o.w = Number(o.w); o.h = Number(o.h); o.wait = Number(o.wait);
  return o;
}

// ─── CDP поверх одного websocket ────────────────────────────────────────────
class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.events = new Map(); }

  static async attach(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const cdp = new Cdp(ws);
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id !== undefined) {
        const p = cdp.pending.get(msg.id);
        if (!p) return;
        cdp.pending.delete(msg.id);
        msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
      } else {
        cdp.events.get(msg.method)?.forEach((fn) => fn(msg.params));
      }
    };
    return cdp;
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  once(method) {
    return new Promise((resolve) => {
      const list = this.events.get(method) ?? [];
      const fn = (p) => {
        this.events.set(method, (this.events.get(method) ?? []).filter((f) => f !== fn));
        resolve(p);
      };
      this.events.set(method, [...list, fn]);
    });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForChrome() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return;
    } catch { /* ещё не поднялся */ }
    await sleep(250);
  }
  throw new Error(`Chrome не поднялся на порту ${PORT}`);
}

async function login(account) {
  const email = ACCOUNTS[account] ?? account;
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (!r.ok) throw new Error(`Логин ${email} не прошёл: ${r.status} ${await r.text()}`);
  const { access_token, user } = await r.json();
  return { token: access_token, user };
}

// ─── основной сценарий ──────────────────────────────────────────────────────
const opt = parseArgs(process.argv.slice(2));
const profileDir = join(tmpdir(), `profy-shot-${process.pid}`);
mkdirSync(profileDir, { recursive: true });

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profileDir}`,
  '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars',
  '--force-device-scale-factor=2',
  '--disable-gpu',
], { stdio: 'ignore' });

let exitCode = 0;
try {
  await waitForChrome();

  const session = opt.anon ? null : await login(opt.account);

  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
    .then((r) => r.json());
  const cdp = await Cdp.attach(target.webSocketDebuggerUrl);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: opt.w, height: opt.h, deviceScaleFactor: 2, mobile: false,
  });
  // Тема читается из localStorage, но 'system' ветка смотрит на media-запрос —
  // выставляем и его, иначе выбор 'system' в снимке всегда будет светлым.
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: opt.theme }],
  });

  // localStorage привязан к origin, поэтому сначала открываем приложение,
  // пишем ключи, и только потом уходим на целевой адрес.
  await cdp.send('Page.navigate', { url: `${APP}/` });
  await cdp.once('Page.loadEventFired');

  const seed = {
    'profy-theme': opt.theme,
    'profy-locale': opt.locale,
    ...(session ? { 'profy-auth': JSON.stringify({ state: { token: session.token, user: session.user }, version: 0 }) } : {}),
  };
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const seed = ${JSON.stringify(seed)};
      ${opt.anon ? "localStorage.removeItem('profy-auth');" : ''}
      for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
      return Object.keys(seed);
    })()`,
    returnByValue: true,
  });

  await cdp.send('Page.navigate', { url: `${APP}${opt.path}` });
  await cdp.once('Page.loadEventFired');
  await sleep(opt.wait);

  // --do: короткий сценарий до снимка. Нужен там, где состояние экрана живёт
  // в локальном стейте и по адресу не достижимо — например шаг онбординга
  // (useProfileSetup держит step в useState). Помощники внутри: fill(), pick(),
  // click(), wait().
  if (opt.do) {
    const helpers = `
      const wait = (ms) => new Promise(r => setTimeout(r, ms));
      const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim();
      // React слушает нативный setter, поэтому просто el.value = v не сработает.
      function setValue(el, v) {
        const proto = el instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      function fill(labelText, value) {
        const label = [...document.querySelectorAll('label')]
          .find(l => norm(l.textContent).toLowerCase().includes(labelText.toLowerCase()));
        const el = label?.control
          ?? label?.parentElement?.querySelector('input, textarea')
          ?? document.querySelector(\`[placeholder*="\${labelText}"]\`);
        if (!el) throw new Error('поле не найдено: ' + labelText);
        setValue(el, value); return el;
      }
      function click(text) {
        const el = [...document.querySelectorAll('button, a, [role=button], [role=option]')]
          .find(b => norm(b.textContent) === norm(text))
          ?? [...document.querySelectorAll('button, a, [role=button]')]
            .find(b => norm(b.textContent).includes(norm(text)));
        if (!el) throw new Error('кнопка не найдена: ' + text);
        el.click(); return el;
      }
      const pick = click;
    `;
    const res = await cdp.send('Runtime.evaluate', {
      expression: `(async () => { ${helpers}\n${opt.do}\n })()`,
      awaitPromise: true, returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error('сценарий упал: ' + (res.exceptionDetails.exception?.description
        ?? res.exceptionDetails.text));
    }
    if (res.result?.value !== undefined) {
      console.log('  --do →', JSON.stringify(res.result.value, null, 2));
    }
    await sleep(600);
  }

  const where = await cdp.send('Runtime.evaluate', {
    expression: 'location.pathname + location.search', returnByValue: true,
  });

  const shot = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: opt.full,
    ...(opt.full ? {} : { clip: { x: 0, y: 0, width: opt.w, height: opt.h, scale: 2 } }),
  });
  writeFileSync(opt.out, Buffer.from(shot.data, 'base64'));

  const landed = where.result.value;
  console.log(`${opt.out}  ${opt.theme}  ${opt.anon ? 'аноним' : opt.account}  →  ${landed}`);
  if (landed !== opt.path && !opt.full) {
    console.log(`  ⚠ запрошено ${opt.path}, гвард увёл на ${landed}`);
  }
} catch (err) {
  console.error('ошибка:', err.message);
  exitCode = 1;
} finally {
  chrome.kill();
  try { rmSync(profileDir, { recursive: true, force: true }); } catch { /* пусто */ }
  process.exit(exitCode);
}

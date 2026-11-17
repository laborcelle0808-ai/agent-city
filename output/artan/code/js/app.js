// Artan shell: hash router, adult/kid mode, parent PIN, screen-time limit, stars badge.
import { store } from './store.js';
import { ctx, toast } from './api.js';
import { gameById } from './kids/games/index.js';

// Each section module default-exports { title, mount(el, ctx) => unmount? }
const SECTIONS = {
  home: () => import('./adult/home.js'),
  plan: () => import('./adult/planner.js'),
  info: () => import('./adult/info.js'),
  media: () => import('./adult/media.js'),
  settings: () => import('./adult/settings.js'),
  kids: () => import('./kids/hub.js'),
};
const KID_ROUTES = new Set(['kids']); // in kid mode only the hub and games are reachable

const main = document.getElementById('main');
const modeBtn = document.getElementById('modeBtn');
const starsEl = document.getElementById('stars');
let unmount = null;
let renderToken = 0;

/* ---------- mode ---------- */
export function getMode() { return store.get('mode', 'adult'); }
function applyMode() {
  const kid = getMode() === 'kid';
  document.body.dataset.mode = kid ? 'kid' : 'adult';
  modeBtn.textContent = kid ? 'Для батьків' : 'Дитячий режим';
}
async function enterKid() {
  store.set('mode', 'kid'); store.set('kidSessionStart', Date.now()); applyMode();
  location.hash = '#kids'; route();
}
async function exitKid() {
  const ok = await parentGate(); if (!ok) return;
  store.set('mode', 'adult'); applyMode(); location.hash = '#home'; route();
}
modeBtn.addEventListener('click', () => (getMode() === 'kid' ? exitKid() : enterKid()));

/** Parent gate: PIN if set, otherwise a simple arithmetic check a small child can't pass. */
export function parentGate() {
  return new Promise((resolve) => {
    const pin = store.get('settings', {}).pin;
    const a = 6 + Math.floor(Math.random() * 7), b = 5 + Math.floor(Math.random() * 8);
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<form class="card" role="dialog" aria-modal="true" aria-labelledby="pg-t">
      <h3 id="pg-t">Тільки для батьків</h3>
      <p class="muted">${pin ? 'Введіть PIN-код, щоб вийти з дитячого режиму.' : `Скільки буде ${a} × ${b}?`}</p>
      <div class="field"><label for="pg-in">${pin ? 'PIN-код' : 'Відповідь'}</label>
      <input id="pg-in" inputmode="numeric" autocomplete="off" ${pin ? 'type="password" maxlength="8"' : ''} required></div>
      <p class="muted" id="pg-err" role="alert"></p>
      <div class="row"><button class="btn secondary" type="button" data-x>Скасувати</button><button class="btn" type="submit">Продовжити</button></div></form>`;
    const close = (v) => { m.remove(); resolve(v); };
    m.querySelector('[data-x]').onclick = () => close(false);
    m.querySelector('form').onsubmit = (e) => {
      e.preventDefault(); const v = m.querySelector('#pg-in').value.trim();
      if (pin ? v === String(pin) : Number(v) === a * b) close(true);
      else m.querySelector('#pg-err').textContent = pin ? 'Неправильний PIN-код.' : 'Неправильно. Спробуйте ще раз.';
    };
    document.body.appendChild(m); m.querySelector('#pg-in').focus();
  });
}

/* ---------- screen time ---------- */
function timeLeftMs() {
  const limit = Number(store.get('settings', {}).kidMinutes || 0); if (!limit) return Infinity;
  const start = store.get('kidSessionStart', Date.now());
  return limit * 60000 - (Date.now() - start);
}
setInterval(() => { if (getMode() === 'kid' && timeLeftMs() <= 0 && !document.querySelector('.rest')) route(); }, 15000);

/* ---------- stars ---------- */
function paintStars(bump) {
  starsEl.querySelector('b').textContent = store.get('stars', 0);
  if (bump) { starsEl.classList.remove('bump'); void starsEl.offsetWidth; starsEl.classList.add('bump'); }
}
window.addEventListener('artan:stars', () => paintStars(true));

/* ---------- router ---------- */
function parse() {
  const h = (location.hash || '').slice(1);
  if (h.startsWith('game-')) return { name: 'game', id: h.slice(5) };
  return { name: h || (getMode() === 'kid' ? 'kids' : 'home') };
}
async function route() {
  const token = ++renderToken;
  if (unmount) { try { unmount(); } catch (e) { console.error(e); } unmount = null; }
  let r = parse();
  const kid = getMode() === 'kid';
  if (kid && r.name !== 'game' && !KID_ROUTES.has(r.name)) { r = { name: 'kids' }; history.replaceState(null, '', '#kids'); }
  if (!kid && !SECTIONS[r.name] && r.name !== 'game') { r = { name: 'home' }; history.replaceState(null, '', '#home'); }

  document.querySelectorAll('.tabbar a').forEach((a) => { if (a.dataset.tab === (r.name === 'game' ? 'kids' : r.name)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });

  main.innerHTML = '';
  const el = document.createElement('div'); el.className = 'view'; main.appendChild(el);

  if (kid && timeLeftMs() <= 0) { renderRest(el); return; }

  try {
    if (r.name === 'game') {
      const g = gameById(r.id); if (!g) { location.hash = '#kids'; return; }
      el.innerHTML = `<div class="game-frame g-frame"><div class="game-head"><button class="game-back" type="button">← До ігор</button><h1>${ctx.esc(g.title)}</h1></div><div class="game-stage g-${g.id}"></div></div>`;
      el.querySelector('.game-back').onclick = () => { location.hash = '#kids'; };
      const mod = await g.load(); if (token !== renderToken) return;
      document.title = `${g.title} · Артан`;
      unmount = mod.default.mount(el.querySelector('.game-stage'), { ...ctx, game: g }) || null;
    } else {
      const mod = await SECTIONS[r.name](); if (token !== renderToken) return;
      document.title = mod.default.title ? `${mod.default.title} · Артан` : 'Артан';
      unmount = (await mod.default.mount(el, { ...ctx, mode: getMode(), enterKid, parentGate })) || null;
    }
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div class="card"><h2>Цей розділ ще будується</h2><p class="muted">Спробуйте інший розділ або оновіть сторінку.</p></div>`;
  }
  main.focus({ preventScroll: true }); window.scrollTo(0, 0);
}
function renderRest(el) {
  el.innerHTML = `<div class="rest"><img src="assets/mascot.svg" alt="" width="180" height="180"><h1>Час відпочити!</h1><p>Ти сьогодні молодець. Покличи дорослих, щоб продовжити.</p><button class="btn" type="button">Я дорослий</button></div>`;
  el.querySelector('button').onclick = async () => { if (await parentGate()) { store.set('kidSessionStart', Date.now()); route(); } };
}

window.addEventListener('hashchange', route);
applyMode(); paintStars(false); route();

// Offline support when served over http(s); skipped where service workers are unavailable.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
export { toast };

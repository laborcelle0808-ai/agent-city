// Shared helpers passed to every section and game as `ctx`.
import { store } from './store.js';

let audio = null;
function ac() {
  if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; } }
  if (audio && audio.state === 'suspended') audio.resume();
  return audio;
}
function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination); o.start(a.currentTime + start); o.stop(a.currentTime + start + dur + 0.05);
}

/** Sound effects. Names: 'tap' | 'ok' | 'fail' | 'win' | 'pop'. Respects the sound setting. */
export function sound(name) {
  if (store.get('settings', {}).sound === false) return;
  switch (name) {
    case 'tap': tone(660, 0, 0.08, 'triangle', 0.12); break;
    case 'pop': tone(880, 0, 0.06, 'square', 0.06); tone(1320, 0.05, 0.06, 'square', 0.05); break;
    case 'ok': tone(523, 0, 0.12); tone(784, 0.1, 0.18); break;
    case 'fail': tone(330, 0, 0.15, 'sawtooth', 0.08); tone(247, 0.12, 0.2, 'sawtooth', 0.08); break;
    case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25)); break;
    default: tone(440, 0, 0.1);
  }
}
/** Play an arbitrary note (for music games). */
export function note(freq, dur = 0.4, type = 'triangle') { tone(freq, 0, dur, type, 0.2); }

/** Speak Ukrainian text if the device has a voice; silently does nothing otherwise. */
export function speak(text) {
  if (store.get('settings', {}).voice === false) return;
  try {
    const synth = window.speechSynthesis; if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'uk-UA'; u.rate = 0.95; u.pitch = 1.1;
    const v = synth.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith('uk')); if (v) u.voice = v;
    synth.speak(u);
  } catch {}
}

/** Add stars to the kid's balance. Fires `artan:stars` with the new total. */
export function reward(n = 1) {
  const total = store.update('stars', (s) => (s || 0) + n, 0);
  window.dispatchEvent(new CustomEvent('artan:stars', { detail: { total, added: n } }));
  return total;
}

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast'); if (!el) return;
  el.textContent = msg; el.hidden = false; clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2400);
}

/** Simple confirm dialog that works without window.confirm. Resolves true/false. */
export function ask(title, text, okLabel = 'Так', cancelLabel = 'Скасувати') {
  return new Promise((resolve) => {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="mt"><h3 id="mt"></h3><p class="muted"></p><div class="row"><button class="btn secondary" data-a="0" type="button"></button><button class="btn" data-a="1" type="button"></button></div></div>`;
    m.querySelector('h3').textContent = title; m.querySelector('p').textContent = text;
    m.querySelector('[data-a="0"]').textContent = cancelLabel; m.querySelector('[data-a="1"]').textContent = okLabel;
    m.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b || e.target === m) { m.remove(); resolve(!!b && b.dataset.a === '1'); } });
    document.body.appendChild(m); m.querySelector('[data-a="1"]').focus();
  });
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/** Inject a <style> block; returns a remover. Games must scope selectors under `.g-<id>`. */
export function injectStyle(id, css) {
  let el = document.getElementById('style-' + id);
  if (!el) { el = document.createElement('style'); el.id = 'style-' + id; document.head.appendChild(el); }
  el.textContent = css; return () => el.remove();
}

export const ctx = { store, sound, note, speak, reward, toast, ask, esc, shuffle, injectStyle };

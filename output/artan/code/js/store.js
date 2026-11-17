// Local-only persistence. Nothing leaves the device.
const PREFIX = 'artan:';
const memory = new Map();

export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? (memory.has(key) ? memory.get(key) : fallback) : JSON.parse(raw);
    } catch { return memory.has(key) ? memory.get(key) : fallback; }
  },
  set(key, value) {
    memory.set(key, value);
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* storage blocked: keep in memory */ }
    return value;
  },
  update(key, fn, fallback = null) { return this.set(key, fn(this.get(key, fallback))); },
  remove(key) { memory.delete(key); try { localStorage.removeItem(PREFIX + key); } catch {} },
  keys() {
    const out = new Set(memory.keys());
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(PREFIX)) out.add(k.slice(PREFIX.length)); } } catch {}
    return [...out];
  },
};

// IndexedDB for photos/videos (blobs). Falls back to in-memory if IndexedDB is unavailable.
const DB_NAME = 'artan-media', STORE = 'items';
const memMedia = new Map();
let dbPromise = null;
function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  }
  return dbPromise;
}
function tx(d, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode); const s = t.objectStore(STORE);
    const r = fn(s); t.oncomplete = () => resolve(r && r.result); t.onerror = () => reject(t.error);
  });
}

/** Media item: {id, name, type, size, created, album, caption, kidSafe, blob} */
export const media = {
  async add(file, meta = {}) {
    const item = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      name: file.name || 'файл', type: file.type || 'application/octet-stream', size: file.size || 0,
      created: Date.now(), album: meta.album || 'Усі', caption: meta.caption || '', kidSafe: !!meta.kidSafe, blob: file };
    const d = await db();
    if (d) await tx(d, 'readwrite', (s) => s.put(item)); else memMedia.set(item.id, item);
    return item;
  },
  async list() {
    const d = await db();
    const items = d ? await new Promise((res) => { const t = d.transaction(STORE).objectStore(STORE).getAll(); t.onsuccess = () => res(t.result); t.onerror = () => res([]); }) : [...memMedia.values()];
    return items.sort((a, b) => b.created - a.created);
  },
  async update(id, patch) {
    const d = await db();
    if (!d) { const it = memMedia.get(id); if (it) Object.assign(it, patch); return it; }
    const it = await new Promise((res) => { const r = d.transaction(STORE).objectStore(STORE).get(id); r.onsuccess = () => res(r.result); r.onerror = () => res(null); });
    if (!it) return null; Object.assign(it, patch); await tx(d, 'readwrite', (s) => s.put(it)); return it;
  },
  async remove(id) { const d = await db(); if (d) await tx(d, 'readwrite', (s) => s.delete(id)); else memMedia.delete(id); },
  async clear() { const d = await db(); if (d) await tx(d, 'readwrite', (s) => s.clear()); else memMedia.clear(); },
};

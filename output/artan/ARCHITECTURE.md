# Артан — архітектура і контракт для агентів

Артан — сімейний застосунок (PWA) для дорослих і дітей. Мова інтерфейсу — **українська**.
Код і коментарі — англійською.

## Принципи (обов'язкові для всіх)
- **Без збірки і без залежностей**: чисті ES-модулі, HTML, CSS. Жодних npm-пакетів у застосунку, жодних CDN-скриптів.
  Єдиний зовнішній ресурс — Google Fonts (є системний запасний шрифт).
- **Приватність**: усі дані тільки на пристрої (localStorage через `store`, фото/відео в IndexedDB через `media`).
  Жодних запитів у мережу, аналітики, реклами, зовнішніх посилань у дитячому режимі.
- **Безпека дітей**: у дитячому режимі немає виходу без батьківської перевірки (`parentGate`), немає зовнішніх посилань,
  немає покупок, немає поля для введення тексту, що кудись відправляється.
- **Доступність**: кнопки ≥ 48px у дитячих іграх (≥ 44px у дорослих), видимий фокус, `aria-label` для іконок,
  контраст тексту ≥ 4.5:1, підтримка `prefers-reduced-motion`.
- **Мобільний пріоритет**: має добре працювати на ширині 360px і на планшеті; без горизонтального скролу.
- **Ніяких** `alert/confirm/prompt` — використовуй `ctx.ask()` і `ctx.toast()`.
- Розмітка, куди вставляється текст користувача, — тільки через `ctx.esc()` або `textContent` (захист від XSS).

## Структура
```
code/
  index.html            оболонка (верхня панель, нижні вкладки)       — owner: core
  css/tokens.css        дизайн-токени (НАЗВИ ТОКЕНІВ НЕ ЗМІНЮВАТИ)    — owner: brand
  css/app.css           оболонка + спільні компоненти               — owner: core
  css/adult.css         стилі дорослих розділів                      — owner: adult
  css/kids.css          стилі дитячого хабу                          — owner: kids-hub
  js/app.js             роутер, режими, PIN, ліміт часу             — owner: core
  js/api.js             ctx: sound, note, speak, reward, toast, ask, esc, shuffle, injectStyle — owner: core
  js/store.js           store (localStorage) + media (IndexedDB)    — owner: core
  js/adult/home.js      головна для дорослих                        — owner: adult
  js/adult/planner.js   сімейний планувальник                       — owner: adult
  js/adult/info.js      поради і статті                             — owner: adult
  js/adult/media.js     фото й відео родини                         — owner: adult
  js/adult/settings.js  налаштування (PIN, ліміт часу, звук, дані)  — owner: adult
  js/kids/hub.js        дитячий хаб з іграми та наліпками           — owner: kids-hub
  js/kids/games/index.js реєстр ігор (вже заповнений)              — owner: core
  js/kids/games/*.js    ігри                                        — owner: games-1 / games-2
  content/articles.js   статті для батьків                          — owner: content
  content/kids-content.js тексти для дітей (слова, тварини, загадки) — owner: content
  assets/logo.svg, assets/icon-maskable.svg, assets/mascot*.svg, assets/icons/*.svg, assets/stickers/*.svg — owner: brand
  media/                демо-відео/зображення                        — owner: video
```

## Модуль розділу (js/adult/*.js, js/kids/hub.js)
```js
export default {
  title: 'План',
  mount(el, ctx) {        // el — порожній <div class="view">
    // ctx: { store, sound, note, speak, reward, toast, ask, esc, shuffle, injectStyle, mode, enterKid, parentGate }
    return () => {};      // необов'язкова функція очищення (таймери, слухачі)
  }
}
```

## Модуль гри (js/kids/games/<id>.js)
```js
export default {
  id: 'memory',
  mount(stage, ctx) {     // stage — <div class="game-stage g-memory">, білий заокруглений блок
    const off = ctx.injectStyle('g-memory', `.g-memory .card{...}`); // ВСІ селектори під .g-<id>
    // ctx.reward(1) — дати зірочку (за кожну перемогу/раунд, не частіше ~1 раз на кілька секунд)
    // ctx.sound('tap'|'ok'|'fail'|'win'|'pop'), ctx.note(freq), ctx.speak('Знайди пару!')
    return () => { off(); /* зупинити таймери, rAF, слухачі */ };
  }
}
```
Вимоги до ігор: великі яскраві елементи, керування дотиком і мишею (pointer events), без тексту, який дитина мусить читати
для розуміння правил (озвучуй `ctx.speak` + показуй картинкою), 2–3 рівні складності, похвала після раунду,
ніякого «програшу» з покаранням — лише м'яке «спробуй ще». Графіку малюй кодом (SVG/Canvas), без зовнішніх файлів
(можна використовувати `assets/mascot.svg`).

## Дані в store (ключі)
- `mode`: `'adult' | 'kid'`
- `settings`: `{ pin?: string, kidMinutes?: number, sound?: boolean, voice?: boolean, childName?: string, childAge?: number, theme?: 'system'|'light'|'dark' }`
- `stars`: number — зірочки дитини
- `stickers`: string[] — відкриті наліпки (id файлів з assets/stickers без .svg)
- `events`: планувальник — `[{id, title, date:'YYYY-MM-DD', time?:'HH:MM', who?: string, category, done?:boolean, repeat?:'none'|'daily'|'weekly'}]`
- `tasks`: `[{id, title, who?, done, due?}]`
- `members`: `[{id, name, role:'adult'|'kid', color}]`
- `favArticles`: string[]
- `gameStats`: `{ [gameId]: { plays, best?, lastPlayed } }` — ігри оновлюють самі

## Маршрути
`#home`, `#plan`, `#info`, `#media`, `#settings`, `#kids`, `#game-<id>`.
`#info` може мати статтю: розділ читає `location.hash`, але хеш має бути простим словом: `#info` + стан у пам'яті.
```

# Артан — як додавати розширення (контракт для агентів)

Застосунок: `app/index.html` (один файл, ES5-стиль, IIFE) + `app/js/map3d.js`, `app/js/diploma.js`, `app/img/emblem.png`.
**`app/index.html` не редагувати** — лише створювати свої файли в `app/js/ext/`. Вони підключаються ДО основного скрипту:
`missions.js`, `games-kids.js`, `games-teen.js`, `media.js`, `events.js`, `parents.js` (відсутній файл не ламає застосунок).

Мова інтерфейсу — українська. Стиль коду: як в оригіналі (ES5: `var`, `function`, без модулів/збірки/бібліотек), обгорнути у `(function(){ ... })();`.
Дизайн: використовувати наявні класи й CSS-змінні оригіналу (`.card .stack .row .sb .wrap .grid2 .btn .pri .ghost .chip .badge .msg.ok/.no .toast .hud .ey .mu .sm .big .bar`, змінні `--bg --sf --sf2 --ln --tx --mu --ac --ye --ok --bad --ease`). Власні стилі — через `<style id="ext-…">`, що додається один раз, з префіксом класів `x-<твій-id>-…`.
Темна тактична естетика, шрифти Oswald/Inter, акцент жовтий `--ye`. Цілі ≥ 48px, `prefers-reduced-motion`, aria-мітки.

## Реєстрація
```js
ArtanExt.mission({ id:'fire', min:6, t:'Пожежна безпека',
  tips:['…','…','…'],                        // 3 поради
  q:[['Питання?',['варіант A','варіант B','варіант C'],0], …] });  // 3 питання, індекс правильної відповіді
// min: 6 | 10 | 14 — з якого віку доступна (вікові програми 6–9, 10–13, 14–17)

ArtanExt.game({ id:'shelter', min:6, emoji:'🏠', title:'Шлях до укриття', desc:'Коротко: що робити', badge:'Назва відзнаки',
  start:function(box, A){            // box — порожній контейнер; A — API
    box.innerHTML='<div class="view stack">'+A.gHead('Шлях до укриття','Підказка')+'…</div>';
    // таймери ТІЛЬКИ через A.later / A.every (очищуються автоматично)
    // кінець гри: A.gEnd(box, 'shelter', 'Шлях до укриття', 'Підсумок рядком', бали(0–40), перемога:true/false)
    return function cleanup(){ /* зняти слухачі window/document, rAF */ };
  }});

ArtanExt.view({ id:'media', title:'Медіатека', sub:'Фото й відео', icon:'cam', home:true,
  render:function(A){ return '<header class="top stack">…</header>…'; },   // HTML рядок
  mount:function(root, A){ /* навісити слухачі на root; повернути cleanup */ } });
// icon — ключ з A.I: ops mem map sch arr nav tee soc sos flag cam pln ply ppl web info
// маршрут: #<id>; з'являється в «Більше», а при home:true — ще й плиткою на головній
```
## API `A`
`S` (стан, зберігається в localStorage через `A.save()`), `ui`, `award(id,pts)`, `gEnd`, `gHead`, `shuffle`, `later`, `every`,
`confetti()`, `esc(str)`, `icon(path)`, `I`, `rank()`, `render()`, `today()`, `photos`, `MISSIONS`, `SPACES` [{c,lon,lat}], `OPS`, `HIST`, `AGES`,
`dl()` → Promise можливості `downloads` (або null поза артефактом).
Глобальний обробник кліків реагує лише на відомі `data-act`; для своїх кнопок використовуй інший атрибут (`data-x`).

## Правила змісту (обов'язково)
- Аудиторія — цивільні та діти. Ігри для дітей — про **безпеку, навички, історію, мислення**. Без стрільби, насильства, зброї як іграшки.
- **Не вигадувати факти** про підрозділ, людей, операції, адреси, телефони чи посилання. Невідоме — заповнювач `[ПОСИЛАННЯ]`, `[ДАТА]`, `[АДРЕСА]`.
  Номери 101/102/103/104/112 — реальні. Інші контакти — лише перевірені, з джерелом.
- Жодних оперативних чи чутливих військових деталей. Нічого, що допомагає ворогу.
- Персональні дані дітей не збирати; все зберігається тільки на пристрої.

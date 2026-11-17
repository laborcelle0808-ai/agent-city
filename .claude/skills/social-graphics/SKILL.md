---
name: social-graphics
description: Создание графики для соцсетей через HTML/CSS → PNG (Playwright). Используй для постов, каруселей, сторис, баннеров, превью.
---
# Графика для соцсетей
**Размеры:** пост 1080×1350 · квадрат 1080×1080 · сторис 1080×1920 (безопасная зона: отступ 250px сверху/снизу) · YouTube 1280×720 · LinkedIn 1200×627 · FB cover 1640×624.
**Процесс:**
1. Сверстай макет в HTML с фиксированным размером body, шрифты из Google Fonts.
2. Рендер:
```js
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(500);
await p.screenshot({ path: process.argv[3] }); await b.close(); })();
```
3. Карусель — один HTML с параметром номера слайда или отдельные файлы slide-1..N.
**Правила:** один фокус, заголовок ≤ 7 слов, минимум 48px для текста, контраст, фирменные цвета, логотип/ник в углу.

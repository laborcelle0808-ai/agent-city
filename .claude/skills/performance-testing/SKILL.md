---
name: performance-testing
description: Нагрузочное тестирование и проверка скорости сайта. Используй для k6/Locust и Lighthouse-аудитов.
---
# Производительность
**k6 (только свои стенды):**
```js
import http from 'k6/http'; import { check, sleep } from 'k6';
export const options = { stages: [{ duration: '1m', target: 50 }, { duration: '3m', target: 50 }, { duration: '1m', target: 0 }],
  thresholds: { http_req_duration: ['p(95)<500'], http_req_failed: ['rate<0.01'] } };
export default () => { const r = http.get(__ENV.BASE_URL); check(r, { '200': x => x.status === 200 }); sleep(1); };
```
Типы: smoke → load → stress → spike → soak.
**Фронт:** Lighthouse (mobile, throttling) — LCP < 2.5s, INP < 200ms, CLS < 0.1, TBT; размер JS, изображения (AVIF/WebP), шрифты (preload, font-display: swap), кэш.
**Отчёт:** метрики до/после, узкие места, исправления по приоритету.

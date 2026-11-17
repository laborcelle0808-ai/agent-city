---
name: landing-page
description: Создание конверсионного лендинга: структура, вёрстка, формы, SEO, деплой. Используй при запросе сайта-лендинга или посадочной страницы.
---
# Лендинг
**Структура:** Hero (УТП + подзаголовок + CTA + визуал) → Боли → Решение/выгоды → Как это работает (3 шага) → Кейсы/портфолио → Отзывы → Тарифы → FAQ → Финальный CTA с формой → Футер.
**Техника:**
- Стек: HTML + Tailwind (CDN) для простого; Astro/Next.js для сложного.
- Адаптив mobile-first, Lighthouse ≥ 90.
- Форма → Telegram-бот (sendMessage) или email-сервис; валидация, защита от спама (honeypot).
- SEO: title, description, OG-теги, favicon, schema.org, sitemap.
- Аналитика: GA4, Meta Pixel, цели на отправку формы.
- Проверка: скриншоты 375/1440 через Playwright.
- Деплой: Vercel / Netlify / GitHub Pages.

---
name: telegram-bot
description: Создание Telegram-бота на aiogram 3: структура проекта, хендлеры, клавиатуры, FSM, оплаты, деплой. Используй при разработке Telegram-ботов.
---
# Telegram-бот (aiogram 3)
**Структура:**
```
bot/
  main.py          # запуск, Dispatcher, роутеры
  config.py        # BOT_TOKEN из env (pydantic-settings)
  handlers/        # start.py, menu.py, admin.py
  keyboards/       # reply.py, inline.py
  states.py        # FSM-состояния
  db.py            # SQLite/PostgreSQL (aiosqlite/asyncpg)
requirements.txt  Dockerfile  .env.example
```
**Функции по запросу:** меню, заявки → админу, рассылка, оплата (Telegram Stars / провайдер), AI-ответы через Claude API, автопостинг в канал, Mini App.
**Правила:** токен только в .env, обработка ошибок, логирование, антифлуд, polling для разработки и webhook для продакшена.
**Деплой:** Docker на VPS / Railway / Render.

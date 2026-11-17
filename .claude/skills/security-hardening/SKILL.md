---
name: security-hardening
description: Чек-лист защиты сайта, сервера, бота и облака. Используй для хардениг-аудита и настройки безопасности.
---
# Хардениг
**Веб:** HTTPS + HSTS · CSP, X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy · куки Secure/HttpOnly/SameSite · CSRF-токены · валидация и экранирование · rate limiting · безопасная загрузка файлов · обновлённые зависимости.
**Авторизация:** bcrypt/argon2 · 2FA для админов · блокировка перебора · короткоживущие токены · проверка прав на каждом запросе (BOLA).
**Сервер:** SSH только по ключу, без root · ufw/фаервол · fail2ban · автообновления · бэкапы с проверкой восстановления.
**Секреты:** только env/secret manager · gitleaks в pre-commit и CI · ротация.
**Облако:** минимальные IAM-права · закрытые бакеты · Supabase RLS / Firebase rules · логи и алерты.
**Боты:** токен в env · проверка secret_token вебхука · проверка admin id · защита от флуда.

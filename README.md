# 🏙️ Город Агентов — SMM · Дизайн · Разработка

```
                         🏛️ МЭРИЯ
                       city-mayor
          ┌──────────────┼──────────────┐
   📱 SMM-КВАРТАЛ   🎨 КВАРТАЛ ДИЗАЙНА   💻 ТЕХНОПАРК
```

## 🏛️ Мэрия
| Агент | Роль |
|---|---|
| `city-mayor` | Оркестратор: разбивает задачу и раздаёт агентам |

## 📱 SMM-квартал (10)
| Агент | Роль |
|---|---|
| `smm-strategist` | Стратегия, ЦА, конкуренты, KPI |
| `copywriter` | Тексты постов, рекламы, лендингов |
| `instagram-expert` | Профиль, Reels, карусели, сторис |
| `tiktok-reels-expert` | Сценарии коротких видео |
| `telegram-expert` | Каналы, посевы, рост |
| `youtube-expert` | Ролики, SEO, превью |
| `linkedin-facebook-expert` | B2B, личный бренд, группы |
| `community-manager` | Комментарии, директ, негатив |
| `ads-targetologist` | Meta/TikTok/Telegram/Google Ads |
| `social-analyst` | Метрики, отчёты, дашборды |

## 🎨 Квартал Дизайна (5)
| Агент | Роль |
|---|---|
| `ui-ux-designer` | Прототипы, дизайн-системы, UX-аудит |
| `brand-designer` | Логотип, фирстиль, брендбук, нейминг |
| `social-graphic-designer` | Посты, карусели, баннеры, превью (PNG) |
| `motion-designer` | Анимации, GIF, видео-монтаж |
| `presentation-designer` | Питч-деки, КП, медиакиты |

## 💻 Технопарк (14)
| Агент | Роль |
|---|---|
| `web-architect` | Стек, архитектура, ТЗ |
| `frontend-dev` | React/Next.js/Vue, вёрстка |
| `backend-dev` | API, авторизация, платежи |
| `fullstack-site-builder` | Лендинги и сайты под ключ |
| `mobile-dev` | iOS/Android, React Native, Flutter |
| `desktop-python-dev` | Программы, утилиты, парсеры |
| `bot-developer` | Telegram/WhatsApp/AI-боты |
| `automation-engineer` | n8n, Make, API, автопостинг |
| `database-engineer` | Схемы БД, SQL, Supabase |
| `devops-engineer` | Docker, CI/CD, деплой |
| `qa-tester` | Тесты, Playwright, баг-репорты |
| `code-reviewer` | Ревью кода |
| `security-auditor` | Аудит безопасности |
| `seo-specialist` | SEO-аудит и продвижение |

## 🧰 Скиллы (16)
**SMM:** `smm-strategy`, `content-plan`, `post-writing`, `hashtag-research`, `video-script`, `ad-campaign`, `analytics-report`
**Дизайн:** `brand-guidelines`, `social-graphics`, `design-system`, `ux-audit`
**Разработка:** `landing-page`, `telegram-bot`, `seo-audit`, `code-review-checklist`
**Общие:** `launch-checklist`

## 🚀 Как пользоваться
Откройте Claude Code в папке `agent-city` и пишите задачи, например:
- «Мэр, запусти бренд кофейни: стратегия, логотип, лендинг и контент-план на месяц»
- «Используй copywriter: 5 постов для Instagram про фитнес»
- «bot-developer, сделай Telegram-бота для записи клиентов»
- «social-graphic-designer, сделай карусель из 7 слайдов на тему…»

Чтобы агенты работали во всех проектах — скопируйте папки в `~/.claude/`:
`cp -r .claude/agents .claude/skills ~/.claude/`

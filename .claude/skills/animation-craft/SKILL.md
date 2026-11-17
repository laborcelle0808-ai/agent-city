---
name: animation-craft
description: Мастерство анимации для веба и соцсетей: принципы, тайминги, GSAP, CSS, Lottie, Rive, экспорт в видео. Используй для любой анимации.
---
# Анимация
**Принципы:** easing (никогда linear для движения объектов), anticipation, follow-through, overlap, stagger, arcs, squash & stretch.
**Тайминги:** микроинтеракции 100–200 мс · переходы UI 200–400 мс · появление секций 600–1000 мс · stagger 40–80 мс.
**Изинги:** выход — power3.out / cubic-bezier(.16,1,.3,1); вход-выход — power2.inOut; пружины — elastic/back только для акцентов.
**Инструменты:**
- CSS transitions/keyframes — простое; View Transitions API — переходы страниц.
- GSAP (+ ScrollTrigger, SplitText, Flip, MorphSVG, DrawSVG, MotionPath) — сложные таймлайны.
- Framer Motion — React; Lottie (lottie-web) — векторные анимации; Rive — интерактивные с состояниями.
**Производительность:** анимируй только transform и opacity, will-change точечно, 60 fps, уважай prefers-reduced-motion.
**Экспорт в видео:** Playwright recordVideo или покадровые скриншоты → ffmpeg:
`ffmpeg -framerate 60 -i frame_%04d.png -c:v libx264 -pix_fmt yuv420p out.mp4`; GIF: `ffmpeg -i out.mp4 -vf "fps=24,scale=720:-1:flags=lanczos" out.gif`.

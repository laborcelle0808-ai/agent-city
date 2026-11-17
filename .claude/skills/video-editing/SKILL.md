---
name: video-editing
description: Монтаж видео кодом: ffmpeg-рецепты, субтитры, форматы под соцсети, Remotion. Используй для обработки и создания видео.
---
# Монтаж видео
**Рецепты ffmpeg:**
- Вертикаль 9:16 с размытым фоном: `-vf "split[a][b];[a]scale=1080:1920,boxblur=20[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"`
- Обрезка: `-ss 00:00:05 -to 00:00:20 -c copy`
- Склейка: concat demuxer со списком файлов.
- Субтитры: `-vf subtitles=subs.ass` (стиль: крупный жирный шрифт, обводка, по центру ниже середины).
- Логотип: `-i logo.png -filter_complex overlay=W-w-40:40`
- Сжатие для соцсетей: `-c:v libx264 -crf 20 -preset slow -c:a aac -b:a 160k -movflags +faststart`
**Форматы:** Reels/TikTok/Shorts 1080×1920 · пост 1080×1350 · YouTube 1920×1080 · до 60 fps.
**Remotion:** композиции на React, useCurrentFrame/interpolate/spring, рендер `npx remotion render`.

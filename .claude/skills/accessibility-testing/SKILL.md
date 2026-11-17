---
name: accessibility-testing
description: Проверка доступности по WCAG 2.2 автоматически (axe) и вручную. Используй для a11y-аудита.
---
# Доступность
**Автоматика:**
```ts
import AxeBuilder from '@axe-core/playwright';
const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag22aa']).analyze();
expect(results.violations).toEqual([]);
```
**Вручную:** только клавиатура (Tab/Shift+Tab/Enter/Esc) · видимый фокус · логичный порядок · один H1 и иерархия заголовков · alt у изображений · label у полей · ошибки форм озвучиваются · контраст · зум 200% без потери контента · prefers-reduced-motion · язык страницы (lang).
**Отчёт:** | Проблема | WCAG | A/AA | Где | Исправление |.

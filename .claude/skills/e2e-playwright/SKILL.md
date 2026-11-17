---
name: e2e-playwright
description: Написание стабильных e2e и скриншот-тестов на Playwright Test. Используй для автотестов сайтов и веб-приложений.
---
# Playwright e2e
```ts
import { test, expect, devices } from '@playwright/test';
test('заявка с лендинга', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /оставить заявку/i }).click();
  await page.getByLabel('Имя').fill('Тест');
  await page.getByLabel('Телефон').fill('+380000000000');
  await page.getByRole('button', { name: /отправить/i }).click();
  await expect(page.getByText(/спасибо/i)).toBeVisible();
});
```
- Локаторы: getByRole > getByLabel > getByTestId; никаких waitForTimeout.
- Page Object Model для повторяемых страниц; фикстуры для логина (storageState).
- Проекты в config: chromium, webkit, Mobile Safari (devices['iPhone 15']).
- Визуальные тесты: `await expect(page).toHaveScreenshot({ fullPage: true, mask: [page.locator('.date')] })`.
- Запуск: `npx playwright test --trace off`; отладка падения — `--trace on`.
- Если в проекте не закреплена своя версия — используй предустановленный Playwright.

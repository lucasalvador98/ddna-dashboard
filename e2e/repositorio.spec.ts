import { test, expect } from '@playwright/test';

test.describe('Repositorio de Archivos', () => {
  test('page loads with header and section header', async ({ page }) => {
    await page.goto('/repositorio');

    await expect(
      page.getByRole('heading', { name: /repositorio/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByText(/gestión y procesamiento/i)).toBeVisible();
  });

  test('hero section is rendered', async ({ page }) => {
    await page.goto('/repositorio');

    await expect(page.getByText(/repositorio ddna/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/archivos propios de la defensoría/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /chat con la bibliografía/i })).toBeVisible();
  });

  test('repo stats and file list appear after data loads', async ({ page }) => {
    await page.goto('/repositorio');

    await expect(page.getByText(/total archivos/i)).toBeVisible({ timeout: 15000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Monitoreo de Medios', () => {
  test('page loads with header, tabs and new register button', async ({ page }) => {
    await page.goto('/monitoreo');

    await expect(
      page.getByRole('heading', { name: /monitoreo de medios/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole('button', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /tabla/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /nuevo registro/i })).toBeVisible();
  });

  test('switching to table view shows the table', async ({ page }) => {
    await page.goto('/monitoreo');

    await page.getByRole('button', { name: /tabla/i }).click();

    await expect(page.getByPlaceholder(/buscar|search/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('new register button opens the form', async ({ page }) => {
    await page.goto('/monitoreo');

    await page.getByRole('button', { name: /nuevo registro/i }).click();

    await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /guardar/i })).toBeVisible();
  });
});

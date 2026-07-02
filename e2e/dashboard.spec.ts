import { test, expect } from '@playwright/test';

test.describe('DDNA Dashboard', () => {
  test('homepage loads and shows KPI cards', async ({ page }) => {
    await page.goto('/');

    // Should have the header with DDNA logo
    await expect(page.locator('header')).toBeVisible();

    // Should have the sidebar with navigation
    await expect(page.locator('aside')).toBeVisible();

    // Should show KPI article cards
    const kpiCards = page.locator('article');
    await expect(kpiCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('navigation works — click Pobreza and see breadcrumb', async ({ page }) => {
    await page.goto('/');

    // Click on Pobreza link in "Explorar por tema" section
    await page.getByRole('link', { name: /pobreza/i, exact: false }).last().click();

    // Should navigate to /pobreza
    await expect(page).toHaveURL(/\/pobreza/);

    // Page should show poverty heading (first h1 is breadcrumb)
    await expect(page.getByRole('heading', { name: /pobreza/i }).first()).toBeVisible();
  });

  test('sidebar collapse toggle works', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('aside');
    const toggleButton = page.getByRole('button', { name: 'Colapsar sidebar' }).first();

    // Sidebar should be expanded initially
    await expect(sidebar).toBeVisible();

    // Click first collapse button (header)
    await toggleButton.click();

    // Button should now say "Expandir"
    await expect(page.getByRole('button', { name: 'Expandir sidebar' }).first()).toBeVisible();
  });

  test('poverty section loads poverty indicators', async ({ page }) => {
    await page.goto('/pobreza');

    await expect(page).toHaveURL(/\/pobreza/);
    await expect(page.getByRole('heading', { name: /pobreza|indigencia/i }).first()).toBeVisible();
  });
});

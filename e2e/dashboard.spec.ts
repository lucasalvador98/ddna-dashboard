import { test, expect } from '@playwright/test';

test.describe('DDNA Dashboard', () => {
  test('homepage loads and shows KPI cards', async ({ page }) => {
    await page.goto('/');

    // Should have the header with DDNA logo
    await expect(page.locator('header')).toBeVisible();

    // Should have the sidebar with navigation
    await expect(page.locator('aside')).toBeVisible();

    // Should show KPI cards
    const kpiCards = page.locator('[class*="kpi"]');
    await expect(kpiCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('navigation works — click Salud and see breadcrumb', async ({ page }) => {
    await page.goto('/');

    // Click on Salud in the sidebar
    await page.getByRole('link', { name: /salud/i }).first().click();

    // Should navigate to /salud
    await expect(page).toHaveURL(/\/salud/);

    // Header should show breadcrumb with Salud
    await expect(page.getByRole('heading', { name: /salud/i })).toBeVisible();
  });

  test('sidebar collapse toggle works', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('aside');
    const toggleButton = sidebar.locator('button[aria-label*="Colapsar"]');

    // Sidebar should be expanded initially
    await expect(sidebar).toBeVisible();

    // Click collapse
    await toggleButton.click();

    // Sidebar should still be present but collapsed (narrower)
    await expect(sidebar).toBeVisible();
  });

  test('poverty section loads poverty indicators', async ({ page }) => {
    await page.goto('/pobreza');

    await expect(page).toHaveURL(/\/pobreza/);
    await expect(page.locator('h1')).toContainText(/pobreza|indigencia/i);
  });
});

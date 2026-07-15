import { test, expect } from '@playwright/test';

test.describe('Navigation & Page Structure', () => {
  test('all main nav links are present in sidebar', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('aside');

    // Core navigation sections
    await expect(sidebar.getByRole('link', { name: /inicio|dashboard/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /pobreza/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /salud/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /educación|educacion/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /seguridad/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /presupuesto/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /infancias/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /encuestas/i })).toBeVisible();
  });

  test('each dashboard page has SectionHeader', async ({ page }) => {
    const pages = [
      { url: '/pobreza', heading: /pobreza|indigencia/i },
      { url: '/salud', heading: /salud/i },
      { url: '/educacion', heading: /educación|educacion/i },
      { url: '/seguridad', heading: /seguridad/i },
      { url: '/presupuesto-nnya', heading: /presupuesto/i },
      { url: '/encuestas', heading: /encuestas/i },
      { url: '/infancias', heading: /infancias/i },
      { url: '/inversion', heading: /inversión|inversion/i },
      { url: '/salud-adolescente', heading: /salud.*adolescente|adolescente/i },
    ];

    for (const { url, heading } of pages) {
      await page.goto(url);
      // Each page should show its SectionHeader heading eventually
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({
        timeout: 15000,
      });
    }
  });

  test('tool pages have SectionHeader', async ({ page }) => {
    const pages = [
      { url: '/apis', heading: /apis|fuentes.*datos/i },
      { url: '/repositorio', heading: /repositorio/i },
      { url: '/geo', heading: /mapas|geoespaciales/i },
      { url: '/ejecutivo', heading: /informe.*ejecutivo/i },
    ];

    for (const { url, heading } of pages) {
      await page.goto(url);
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({
        timeout: 15000,
      });
    }
  });
});

import { test, expect } from '@playwright/test';

// Public forms slice (PR3): the standalone /f/[slug] layout renders without
// dashboard chrome. The unavailable path is hermetic (no seeded data needed);
// the happy path (build → publish → respond → confirmation) is covered by the
// unit tests of the submit route and the public form client.

test.describe('Public forms (/f/[slug])', () => {
  test('unknown slug shows the unavailable screen without dashboard chrome', async ({ page }) => {
    await page.goto('/f/slug-inexistente-xyz');

    await expect(
      page.getByRole('heading', { name: 'Formulario no disponible' }),
    ).toBeVisible({ timeout: 15000 });

    // AppShell renders raw children for /f/*: no dashboard-only elements.
    await expect(page.getByText('Saltar al contenido principal')).toHaveCount(0);
  });
});

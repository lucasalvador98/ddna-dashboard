import { test, expect } from '@playwright/test';

// Admin responses slice (PR4): the responses page is behind the module's
// LoginGate; the full flow (list → detail → delete → CSV) needs seeded data and
// an authenticated admin, so it is covered by the unit tests of the client and
// the actions. This spec covers the deterministic hermetic path only: an
// unknown form id renders the "Formulario no encontrado" empty state (auth
// disabled in the E2E env, same assumption as the monitoreo suite).

test.describe('Admin responses (/formularios/respuestas/[id])', () => {
  test('unknown form id shows the not-found empty state', async ({ page }) => {
    await page.goto('/formularios/respuestas/00000000-0000-0000-0000-000000000000');

    await expect(page.getByText('Formulario no encontrado.')).toBeVisible({ timeout: 15000 });
  });
});

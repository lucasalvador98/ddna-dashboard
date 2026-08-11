import { test, expect } from '@playwright/test';

// Full-flow E2E for formularios (§7.10): admin creates a form,
// a visitor submits it anonymously, admin views the response,
// and an inactive form rejects submissions.
//
// Auth is done through the real login page; credentials come from
// env vars. When E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are not set
// the test is skipped (no-op).

const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe('Forms full flow (§7.10)', () => {
  const SLUG = 'e2e-full-flow-spec';
  const TITLE = 'E2E Full Flow Spec';

  test.beforeAll(() => {
    test.skip(
      !EMAIL || !PASSWORD,
      'E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD env vars required for auth'
    );
  });

  test('admin creates form, visitor submits, admin views response, inactive form rejects submit', async ({
    page,
    request,
  }) => {
    // ── 1. Login as admin ───────────────────────────────────────────────
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await page.getByLabel('Email').fill(EMAIL!);
    await page.getByLabel('Contraseña').fill(PASSWORD!);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // ── 2. Create form via builder ─────────────────────────────────────
    await page.goto('/formularios/nuevo');
    await expect(page.getByText('Nuevo formulario')).toBeVisible();

    await page.getByPlaceholder('Nombre del formulario').fill(TITLE);
    await page.getByLabel('Slug').fill(SLUG);

    // Add a text field
    await page.getByRole('button', { name: 'Agregar campo' }).click();
    const textoOption = page.getByRole('button', { name: 'Texto' });
    await textoOption.click();
    await page.getByPlaceholder('Escribí la pregunta…').fill('Nombre');
    await page.getByPlaceholder('Escribí la pregunta…').blur();

    await page.getByRole('button', { name: 'Guardar' }).click();

    // Builder redirects to /formularios on create success
    await page.waitForURL('**/formularios', { timeout: 15000 });
    await expect(page.getByText(TITLE).first()).toBeVisible({ timeout: 10000 });

    // ── 3. Public view at /f/[slug] ──────────────────────────────────────
    await page.goto(`/f/${SLUG}`);
    await expect(page.getByRole('heading', { name: TITLE })).toBeVisible({
      timeout: 10000,
    });

    // ── 4. Submit response (anonymous via UI) ──────────────────────────
    await page.locator('form').getByRole('textbox').first().fill('Juan Pérez');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText(/recibida/i)).toBeVisible({ timeout: 10000 });

    // ── 5. Admin views response ────────────────────────────────────────
    await page.goto('/formularios');
    await expect(page.getByText(TITLE).first()).toBeVisible();

    const formCard = page
      .locator('.space-y-4 > div')
      .filter({ hasText: TITLE })
      .first();
    await formCard.getByRole('link', { name: 'Respuestas' }).click();
    await page.waitForURL('**/formularios/respuestas/**', { timeout: 10000 });

    // Should NOT show the empty state (we have one response)
    await expect(
      page.getByText('Todavía no hay respuestas para este formulario.')
    ).toHaveCount(0);

    // ── 6. Deactivate the form ─────────────────────────────────────────
    await page.goto('/formularios');
    await expect(page.getByText(TITLE).first()).toBeVisible();

    // Toggle: find the card, then click the "Activo" label inside its Toggle
    const card = page.locator('.space-y-4 > div').filter({ hasText: TITLE }).first();
    await card.getByText('Activo').click();
    // Wait for the toast confirmation
    await expect(
      page.getByText('Formulario desactivado.')
    ).toBeVisible({ timeout: 10000 });

    // ── 7. Public view: inactive → unavailable screen ─────────────────
    await page.goto(`/f/${SLUG}`);
    await expect(
      page.getByRole('heading', { name: 'Formulario no disponible' })
    ).toBeVisible({ timeout: 10000 });

    // ── 8. API reject: POST to submit endpoint for inactive form ──────
    const apiRes = await request.post('/api/formularios/submit', {
      headers: { 'Content-Type': 'application/json' },
      data: { slug: SLUG, respuestas: { dummy: 'test' } },
    });
    expect(apiRes.status()).toBe(404);
  });
});

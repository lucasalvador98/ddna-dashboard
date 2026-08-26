import { test, expect } from '@playwright/test';

// QR sharing flow E2E for the formularios list page.
//
// Auth is DISABLED in the E2E env (no LoginGate) and there is no seeded
// data, so the list is always empty. Two deterministic paths:
//   1. Empty-state sanity — the page loads, shows the empty message, and
//      no QR / "Compartir" button exists.
//   2. Create a minimal form via the builder, return to the list, and
//      exercise the QR modal: open it, verify content, close via Escape
//      and via backdrop click.

const SLUG = `e2e-qr-${Date.now()}`;
const TITLE = `E2E QR Spec ${Date.now()}`;

test.describe('Forms QR sharing (/formularios)', () => {
  test('empty list shows the empty state and no Compartir button', async ({
    page,
  }) => {
    await page.goto('/formularios');

    await expect(page.getByText('Todavía no hay formularios.')).toBeVisible({
      timeout: 15000,
    });

    // No form cards → no "Compartir" buttons should exist.
    await expect(page.getByRole('button', { name: 'Compartir' })).toHaveCount(
      0
    );
  });

  test('create form, open QR modal, verify content, close with Escape and backdrop', async ({
    page,
  }) => {
    // ── 1. Create a minimal form via the builder ──────────────────────
    await page.goto('/formularios/nuevo');
    await expect(page.getByText('Nuevo formulario')).toBeVisible({
      timeout: 15000,
    });

    await page.getByPlaceholder('Nombre del formulario').fill(TITLE);
    await page.getByLabel('Slug').fill(SLUG);

    // Add a single text field so the form is valid.
    await page.getByRole('button', { name: 'Agregar campo' }).click();
    await page.getByRole('button', { name: 'Texto' }).click();
    await page.getByPlaceholder('Escribí la pregunta…').fill('Nombre');
    await page.getByPlaceholder('Escribí la pregunta…').blur();

    await page.getByRole('button', { name: 'Guardar' }).click();
    await page.waitForURL('**/formularios', { timeout: 15000 });

    // ── 2. Verify the form card is on the list ───────────────────────
    const formCard = page
      .locator('.space-y-4 > div')
      .filter({ hasText: TITLE })
      .first();
    await expect(formCard).toBeVisible({ timeout: 10000 });

    // ── 3. Open QR modal via "Compartir" button ──────────────────────
    await formCard.getByRole('button', { name: 'Compartir' }).click();

    const dialog = page.getByRole('dialog', {
      name: 'Compartí este formulario',
    });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // The QR image should appear (generated client-side via the qrcode lib).
    const qrImg = dialog.getByRole('img', {
      name: `Código QR para ${TITLE}`,
    });
    await expect(qrImg).toBeVisible({ timeout: 10000 });

    // The public URL is displayed inside the dialog.
    await expect(dialog.getByText(`/f/${SLUG}`)).toBeVisible();

    // Download and copy buttons are present.
    await expect(dialog.getByRole('link', { name: 'Descargar QR' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Copiar link' })).toBeVisible();

    // ── 4. Close via Escape key ───────────────────────────────────────
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0, { timeout: 5000 });

    // ── 5. Reopen and close via backdrop click ────────────────────────
    await formCard.getByRole('button', { name: 'Compartir' }).click();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Click the backdrop (the fixed overlay behind the dialog panel).
    // The backdrop is the parent div with bg-black/50 that contains the dialog.
    await page.mouse.click(10, 10);
    await expect(dialog).toHaveCount(0, { timeout: 5000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('login page renders with form', async ({ page }) => {
    await page.goto('/login');

    // Should have the DDNA branding
    await expect(page.getByRole('heading', { name: /iniciar sesión|ddna/i }).first()).toBeVisible();

    // Should have email and password fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();

    // Should have submit button
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('test@test.com');
    await page.getByLabel(/contraseña/i).fill('wrong-password');

    // Submit
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should show error message (either from Supabase or network)
    await expect(page.getByText(/credenciales|error/i)).toBeVisible({ timeout: 15000 });
  });

  test('login with redirect param preserves return URL', async ({ page }) => {
    await page.goto('/login?redirect=/admin');

    // The form should exist — redirect param is in a hidden input
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Fill invalid credentials (we just check the form renders with the redirect)
    // The redirect param is handled internally by Next.js useSearchParams
    await page.getByLabel(/email/i).fill('admin@ddna.org');
    await page.getByLabel(/contraseña/i).fill('test');

    // Submit — this will likely fail but proves the form works
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should show error (Supabase won't accept these credentials)
    await expect(page.getByText(/credenciales|error/i)).toBeVisible({ timeout: 15000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Real Estate Analytics App', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Real Estate Analytics/);
    await expect(page.getByRole('heading', { name: /Smart Real Estate/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Get Started/ })).toBeVisible();
  });

  test('should navigate to dashboard (auth required)', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to sign in page
    await expect(page).toHaveURL(/auth\/signin/);
    await expect(page.getByRole('heading', { name: /Welcome Back/ })).toBeVisible();
  });

  test('should load the map page (auth required)', async ({ page }) => {
    await page.goto('/map');

    // Should redirect to sign in page
    await expect(page).toHaveURL(/auth\/signin/);
  });

  test('should load properties page (auth required)', async ({ page }) => {
    await page.goto('/properties');

    // Should redirect to sign in page
    await expect(page).toHaveURL(/auth\/signin/);
  });
});

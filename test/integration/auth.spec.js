const { test, expect } = require('@playwright/test');

test.describe('Auth - login redirect and return', () => {
  test('shows sign-in link when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Sign In with Spotify' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Songs' })).not.toBeVisible();
  });

  test('after test login, returns to app with authenticated UI', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Sign In with Spotify' })).toBeVisible();

    const loginResponse = await page.request.get('/test/login');
    expect(loginResponse.status()).toBe(204);

    await page.reload();
    await expect(page.getByRole('tab', { name: 'Songs' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In with Spotify' })).not.toBeVisible();
    await expect(page.getByText(/Signed in as/)).toBeVisible();
  });

  test('logout returns to sign-in state', async ({ page }) => {
    await page.request.get('/test/login');
    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Songs' })).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).first().click();
    await expect(page.getByRole('link', { name: 'Sign In with Spotify' })).toBeVisible();
  });
});

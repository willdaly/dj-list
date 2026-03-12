const { test, expect } = require('@playwright/test');

test.describe('Search and filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.get('/test/login');
  });

  test('genre+BPM+key search returns results', async ({ page }) => {
    const token = Date.now();
    const song = `Search Song ${token}`;
    await page.request.post('/createSong', {
      form: {
        BPM: '100',
        Key: 'AbM',
        Title: song,
        Artist: 'Search Artist',
        Album: 'Search Album',
        genre: 'Hip-Hop'
      }
    });

    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Songs' })).toBeVisible();
    await page.getByRole('button', { name: 'Genres + BPM + Key' }).click();
    await expect(page.getByText(song)).toBeVisible();
  });

  test('text search by artist returns results', async ({ page }) => {
    const token = Date.now();
    const artist = `Artist${token}`;
    const song = `TextSearchSong ${token}`;
    await page.request.post('/createSong', {
      form: {
        BPM: '100',
        Key: 'AbM',
        Title: song,
        Artist: artist,
        Album: 'Album',
        genre: 'Hip-Hop'
      }
    });

    await page.goto('/');
    await page.getByPlaceholder('Artist, Album, Song').fill(artist);
    await page.locator('select').filter({ hasText: 'Smart' }).selectOption('artist');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText(song)).toBeVisible();
  });

  test('genre-only search returns results', async ({ page }) => {
    const token = Date.now();
    const song = `GenreOnly ${token}`;
    await page.request.post('/createSong', {
      form: {
        BPM: '90',
        Key: 'CM',
        Title: song,
        Artist: 'Artist',
        Album: 'Album',
        genre: 'Hip-Hop'
      }
    });

    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Songs' })).toBeVisible();
    await page.getByRole('button', { name: 'Genres', exact: true }).click();
    await expect(page.getByText(song)).toBeVisible({ timeout: 5000 });
  });
});

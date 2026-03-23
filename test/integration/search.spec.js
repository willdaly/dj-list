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

test.describe('KG-powered features', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.get('/test/login');
  });

  test('KG action buttons appear when a song is selected', async ({ page }) => {
    const token = Date.now();
    const song = `KG Song ${token}`;
    await page.request.post('/createSong', {
      form: {
        BPM: '100',
        Key: 'AbM',
        Title: song,
        Artist: 'KG Artist',
        Album: 'KG Album',
        genre: 'Hip-Hop'
      }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Genres + BPM + Key' }).click();
    await expect(page.getByText(song)).toBeVisible();

    // KG buttons hidden before selection
    await expect(page.getByRole('button', { name: 'Harmonic Matches' })).not.toBeVisible();

    // Select the song
    await page.getByText(song).click();

    // KG buttons visible after selection
    await expect(page.getByRole('button', { name: 'Harmonic Matches' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Similar Tracks' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Track Ideas' })).toBeVisible();
  });

  test('harmonic matches and back navigation work', async ({ page }) => {
    const token = Date.now();
    const song = `HM Song ${token}`;
    await page.request.post('/createSong', {
      form: {
        BPM: '100',
        Key: 'AbM',
        Title: song,
        Artist: 'HM Artist',
        Album: 'HM Album',
        genre: 'Hip-Hop'
      }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Genres + BPM + Key' }).click();
    await expect(page.getByText(song)).toBeVisible();

    await page.getByText(song).click();
    await page.getByRole('button', { name: 'Harmonic Matches' }).click();

    // Should show the KG view label and back button
    await expect(page.getByText('Back to results')).toBeVisible();
    await expect(page.getByText('Harmonic matches for')).toBeVisible();

    // Click back to restore previous results
    await page.getByText('Back to results').click();
    await expect(page.getByText(song)).toBeVisible();
    await expect(page.getByText('Back to results')).not.toBeVisible();
  });

  test('harmonic endpoint returns 404 for nonexistent song', async ({ page }) => {
    const resp = await page.request.post('/song/000000000000000000000000/harmonic');
    expect(resp.status()).toBe(404);
  });
});

const { test, expect } = require('@playwright/test');

test('can search and render results, then open playlists', async ({ page }) => {
  const token = Date.now();
  const artist = `Smoke Artist ${token}`;
  const song = `Smoke Song ${token}`;

  const loginResponse = await page.request.get('/test/login');
  expect(loginResponse.status()).toBe(204);

  const createResponse = await page.request.post('/createSong', {
    form: {
      BPM: '100',
      Key: 'AbM',
      Title: song,
      Artist: artist,
      Album: 'Smoke Album',
      genre: 'Hip-Hop'
    }
  });
  expect(createResponse.status()).toBe(200);

  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'Songs' })).toBeVisible();
  await page.getByRole('button', { name: 'Genres + BPM + Key' }).click();
  await expect(page.getByText(song)).toBeVisible();

  await page.getByRole('tab', { name: 'Playlists' }).click();
  await expect(page.getByRole('heading', { name: 'Playlists' })).toBeVisible();
});

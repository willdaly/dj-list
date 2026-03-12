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
  await page.click('#bpmKeyFilter');
  await expect(page.locator('#searchResults')).toContainText(song);

  await page.click('#playlistsButton');
  await expect(page.locator('.playlistsIndex')).toBeVisible();
});

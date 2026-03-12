const { test, expect } = require('@playwright/test');

test.describe('Playlist CRUD and reorder', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.get('/test/login');
  });

  test('create playlist with selected songs', async ({ page }) => {
    const token = Date.now();
    const song1 = `PlaylistSong1 ${token}`;
    const song2 = `PlaylistSong2 ${token}`;
    await page.request.post('/createSong', {
      form: { BPM: '100', Key: 'AbM', Title: song1, Artist: 'A', Album: 'B', genre: 'Hip-Hop' }
    });
    await page.request.post('/createSong', {
      form: { BPM: '100', Key: 'AbM', Title: song2, Artist: 'A', Album: 'B', genre: 'Hip-Hop' }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Genres + BPM + Key' }).click();
    await expect(page.getByText(song1)).toBeVisible();

    await page.locator(`[data-song-title="${song1}"]`).click();
    await page.locator(`[data-song-title="${song2}"]`).click({ modifiers: ['Meta'] });

    await page.getByRole('tab', { name: 'Playlists' }).click();
    await page.getByPlaceholder('Check songs above, enter name').fill(`MyList ${token}`);
    await page.getByRole('button', { name: 'Create Playlist' }).click();

    await expect(page.getByRole('status').filter({ hasText: `Created "MyList ${token}"` }).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: `MyList ${token}` }).click();
    await expect(page.getByText(song1)).toBeVisible();
    await expect(page.getByText(song2)).toBeVisible();
  });

  test('rename playlist', async ({ page }) => {
    const token = Date.now();
    const song = `RenameSong ${token}`;
    await page.request.post('/createSong', {
      form: { BPM: '100', Key: 'AbM', Title: song, Artist: 'A', Album: 'B', genre: 'Hip-Hop' }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Genres + BPM + Key' }).click();
    await expect(page.getByText(song)).toBeVisible();
    await page.locator(`[data-song-title="${song}"]`).click();
    await page.getByRole('tab', { name: 'Playlists' }).click();
    await page.getByPlaceholder('Check songs above, enter name').fill(`Original ${token}`);
    await page.getByRole('button', { name: 'Create Playlist' }).click();

    await expect(page.getByRole('button', { name: `Original ${token}` })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: `Original ${token}` }).click();
    await page.getByPlaceholder('New name').fill(`Renamed ${token}`);
    await page.getByRole('button', { name: 'Rename', exact: true }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Playlist renamed.' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: `Renamed ${token}` })).toBeVisible();
  });

  test('remove songs from playlist and delete playlist', async ({ page }) => {
    const token = Date.now();
    const song = `DeleteSong ${token}`;
    await page.request.post('/createSong', {
      form: { BPM: '100', Key: 'AbM', Title: song, Artist: 'A', Album: 'B', genre: 'Hip-Hop' }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Genres + BPM + Key' }).click();
    await expect(page.getByText(song)).toBeVisible();
    await page.getByText(song).click();
    await page.getByRole('tab', { name: 'Playlists' }).click();
    await page.getByPlaceholder('Check songs above, enter name').fill(`ToDelete ${token}`);
    await page.getByRole('button', { name: 'Create Playlist' }).click();

    await page.getByRole('button', { name: `ToDelete ${token}` }).click();
    await page.locator(`[data-song-title="${song}"]`).click();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Delete playlist' }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Playlist deleted.' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: `ToDelete ${token}` })).not.toBeVisible();
  });

  test('playlist shows songs with order column and add-to-playlist works', async ({ page }) => {
    const token = Date.now();
    const song1 = `AddSong1 ${token}`;
    const song2 = `AddSong2 ${token}`;
    await page.request.post('/createSong', {
      form: { BPM: '100', Key: 'AbM', Title: song1, Artist: 'A', Album: 'B', genre: 'Hip-Hop' }
    });
    await page.request.post('/createSong', {
      form: { BPM: '100', Key: 'AbM', Title: song2, Artist: 'A', Album: 'B', genre: 'Hip-Hop' }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Genres + BPM + Key' }).click();
    await expect(page.getByText(song1)).toBeVisible();
    await page.locator(`[data-song-title="${song1}"]`).click();
    await page.getByRole('tab', { name: 'Playlists' }).click();
    await page.getByPlaceholder('Check songs above, enter name').fill(`AddTest ${token}`);
    await page.getByRole('button', { name: 'Create Playlist' }).click();
    await expect(page.getByRole('button', { name: `AddTest ${token}` })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: `AddTest ${token}` }).click();

    await expect(page.getByText(song1)).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '#' })).toBeVisible();

    await page.getByRole('button', { name: '← Back to list' }).click();
    await page.getByRole('tab', { name: 'Songs' }).click();
    await expect(page.getByText(song2)).toBeVisible();
    await page.locator(`[data-song-title="${song2}"]`).click();
    await page.getByRole('tab', { name: 'Playlists' }).click();
    await page.getByRole('button', { name: 'Add songs' }).first().click();

    await expect(page.getByRole('status').filter({ hasText: 'Playlist updated.' }).first()).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: `AddTest ${token}` }).click();
    await expect(page.getByText(song1)).toBeVisible();
    await expect(page.getByText(song2)).toBeVisible();
  });
});

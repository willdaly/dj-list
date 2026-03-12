'use strict';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SEARCH_URL = 'https://api.spotify.com/v1/search';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function searchPreviewUrl(artist, title) {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }

  const query = [artist, title].filter(Boolean).join(' ');
  if (!query.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: '1'
  });

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const track = data.tracks?.items?.[0];
  return track?.preview_url || null;
}

module.exports = { searchPreviewUrl };

import { useEffect, useState } from 'react';
import { apiClient } from './api/client';
import { ApiClientError } from './api/http';
import type { SessionState, Song } from './types/models';

export function App() {
  const [query, setQuery] = useState('James Brown');
  const [songs, setSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<string>('Loading session...');
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const currentSession = await apiClient.session();
        setSession(currentSession);
        setStatus(currentSession.authenticated ? 'Signed in.' : 'Not signed in.');
      } catch (error) {
        if (error instanceof ApiClientError) {
          setStatus(error.userMessage);
          return;
        }
        setStatus('Unable to load session state.');
      }
    }

    void bootstrapSession();
  }, []);

  async function runSearch() {
    setStatus('Loading...');
    try {
      const results = await apiClient.searchSongs(query);
      setSongs(results.slice(0, 5));
      setStatus(`Loaded ${results.length} song(s).`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setStatus(error.userMessage);
        return;
      }
      setStatus('Unexpected error while calling API.');
    }
  }

  async function runLogout() {
    setStatus('Signing out...');
    try {
      await apiClient.logout();
      setSession({authenticated: false, user: null});
      setSongs([]);
      setStatus('Signed out.');
    } catch (error) {
      if (error instanceof ApiClientError) {
        setStatus(error.userMessage);
        return;
      }
      setStatus('Unable to sign out.');
    }
  }

  return (
    <main className="app-shell">
      <h1>DJ List</h1>
      <p className="hint">React auth handshake now uses the existing Express session as source of truth.</p>

      <p className="status">{status}</p>

      {session?.authenticated ? (
        <>
          <p>
            Signed in as <strong>{session.user?.displayName || session.user?.email || 'Spotify user'}</strong>
          </p>
          <div className="search-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs" />
            <button
              type="button"
              onClick={() => {
                void runSearch();
              }}
            >
              Search
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                void runLogout();
              }}
            >
              Logout
            </button>
          </div>
          {songs.length > 0 ? (
            <ul className="results">
              {songs.map((song) => (
                <li key={song._id}>
                  {song.Artist} - {song.Song}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <a className="spotify-link" href="/auth/spotify">
          Sign In with Spotify
        </a>
      )}
    </main>
  );
}

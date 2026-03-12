import { useEffect, useState } from 'react';
import { apiClient } from './api/client';
import { ApiClientError } from './api/http';
import type { SessionState, Song } from './types/models';
import { GenreKeyBpmControls } from './components/GenreKeyBpmControls';
import { ResultsTable } from './components/ResultsTable';
import { TextSearchControls, type TextSearchMode } from './components/TextSearchControls';

export function App() {
  const [query, setQuery] = useState('');
  const [textSearchMode, setTextSearchMode] = useState<TextSearchMode>('smart');
  const [songs, setSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<string>('Loading session...');
  const [session, setSession] = useState<SessionState | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Hip-Hop']);
  const [keyValue, setKeyValue] = useState('AbM');
  const [bpmMin, setBpmMin] = useState(88);
  const [bpmMax, setBpmMax] = useState(102);

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

  function applyResults(results: Song[]) {
    setSongs(results);
    setStatus(results.length > 0 ? `Loaded ${results.length} song(s).` : 'No songs found.');
  }

  function handleApiError(error: unknown) {
    if (error instanceof ApiClientError) {
      setStatus(error.userMessage);
      return;
    }
    setStatus('Unexpected error while calling API.');
  }

  function hasGenreSelection(): boolean {
    if (selectedGenres.length > 0) {
      return true;
    }
    setStatus('Select at least one genre.');
    return false;
  }

  function normalizeBpmRange(): [number, number] | null {
    if (Number.isNaN(bpmMin) || Number.isNaN(bpmMax)) {
      setStatus('BPM range must be numeric.');
      return null;
    }
    if (bpmMin > bpmMax) {
      setStatus('BPM min cannot be greater than BPM max.');
      return null;
    }
    return [bpmMin, bpmMax];
  }

  function toggleGenre(genre: string) {
    setSelectedGenres((current) =>
      current.includes(genre) ? current.filter((entry) => entry !== genre) : [...current, genre]
    );
  }

  async function runGenreSearch() {
    if (!hasGenreSelection()) {
      return;
    }
    setStatus('Loading...');
    try {
      applyResults(await apiClient.filterByGenre(selectedGenres));
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runBpmSearch() {
    if (!hasGenreSelection()) {
      return;
    }
    const bpmRange = normalizeBpmRange();
    if (!bpmRange) {
      return;
    }
    setStatus('Loading...');
    try {
      applyResults(await apiClient.filterByBpm(selectedGenres, bpmRange));
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runKeySearch() {
    if (!hasGenreSelection()) {
      return;
    }
    setStatus('Loading...');
    try {
      applyResults(await apiClient.filterByKey(selectedGenres, keyValue));
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runBpmKeySearch() {
    if (!hasGenreSelection()) {
      return;
    }
    const bpmRange = normalizeBpmRange();
    if (!bpmRange) {
      return;
    }
    setStatus('Loading...');
    try {
      applyResults(await apiClient.filterByBpmKey({ genres: selectedGenres, bpmRange, key: keyValue }));
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runTextSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      setStatus('Enter search text.');
      return;
    }

    setStatus('Loading...');
    try {
      if (textSearchMode === 'artist') {
        applyResults(await apiClient.searchByArtist(trimmed));
        return;
      }
      if (textSearchMode === 'album') {
        applyResults(await apiClient.searchByAlbum(trimmed));
        return;
      }
      if (textSearchMode === 'song') {
        applyResults(await apiClient.searchBySong(trimmed));
        return;
      }
      applyResults(await apiClient.searchSongs(trimmed));
    } catch (error) {
      handleApiError(error);
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
      handleApiError(error);
    }
  }

  return (
    <main className="app-shell">
      <h1>DJ List</h1>
      <p className="hint">React auth handshake now uses the existing Express session as source of truth.</p>

      <p className="status">{status}</p>

      {session?.authenticated ? (
        <>
          <p className="user-row">
            Signed in as <strong>{session.user?.displayName || session.user?.email || 'Spotify user'}</strong>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                void runLogout();
              }}
            >
              Logout
            </button>
          </p>

          <GenreKeyBpmControls
            selectedGenres={selectedGenres}
            keyValue={keyValue}
            bpmMin={bpmMin}
            bpmMax={bpmMax}
            onToggleGenre={toggleGenre}
            onKeyChange={setKeyValue}
            onBpmMinChange={setBpmMin}
            onBpmMaxChange={setBpmMax}
            onSearchByGenre={() => {
              void runGenreSearch();
            }}
            onSearchByBpm={() => {
              void runBpmSearch();
            }}
            onSearchByKey={() => {
              void runKeySearch();
            }}
            onSearchByBpmKey={() => {
              void runBpmKeySearch();
            }}
          />

          <TextSearchControls
            query={query}
            mode={textSearchMode}
            onQueryChange={setQuery}
            onModeChange={setTextSearchMode}
            onSearch={() => {
              void runTextSearch();
            }}
          />

          <ResultsTable songs={songs} />
        </>
      ) : (
        <a className="spotify-link" href="/auth/spotify">
          Sign In with Spotify
        </a>
      )}
    </main>
  );
}

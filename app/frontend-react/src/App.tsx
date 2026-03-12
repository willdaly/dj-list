import { useEffect, useState } from 'react';
import { apiClient } from './api/client';
import { ApiClientError } from './api/http';
import type { Playlist, SessionState, Song } from './types/models';
import { GenreKeyBpmControls } from './components/GenreKeyBpmControls';
import { Nav } from './components/Nav';
import { PlaylistPanel } from './components/PlaylistPanel';
import { ResultsTable } from './components/ResultsTable';
import { TextSearchControls, type TextSearchMode } from './components/TextSearchControls';
import { useToast } from './context/ToastContext';

export function App() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [textSearchMode, setTextSearchMode] = useState<TextSearchMode>('smart');
  const [viewMode, setViewMode] = useState<'songs' | 'playlists'>('songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<string>('Loading session...');
  const [session, setSession] = useState<SessionState | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Hip-Hop']);
  const [keyValue, setKeyValue] = useState('AbM');
  const [bpmMin, setBpmMin] = useState(88);
  const [bpmMax, setBpmMax] = useState(102);

  function handleApiError(error: unknown) {
    if (error instanceof ApiClientError) {
      setStatus(error.userMessage);
      return;
    }
    setStatus('Unexpected error while calling API.');
  }

  useEffect(() => {
    const initialError = document.body.dataset.initialError;
    if (initialError) {
      document.body.dataset.initialError = '';
      toast.notify(initialError, 'error');
    }
  }, [toast]);

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

  useEffect(() => {
    if (viewMode === 'playlists' && session?.authenticated) {
      apiClient
        .listPlaylists()
        .then(setPlaylists)
        .catch(handleApiError);
    }
  }, [viewMode, session?.authenticated]);

  useEffect(() => {
    if (!activePlaylistId || !session?.authenticated) return;
    const id = activePlaylistId;
    let cancelled = false;
    apiClient
      .showPlaylist(id)
      .then((songsList) => {
        if (!cancelled) {
          setPlaylistSongs(songsList);
          setStatus(`Loaded ${songsList.length} song(s).`);
        }
      })
      .catch((err) => {
        if (!cancelled) handleApiError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [activePlaylistId, session?.authenticated]);

  function applyResults(results: Song[]) {
    setSongs(results);
    setSelectedIds([]);
    setStatus(results.length > 0 ? `Loaded ${results.length} song(s).` : 'No songs found.');
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
    if (!hasGenreSelection()) return;
    setStatus('Loading...');
    try {
      applyResults(await apiClient.filterByGenre(selectedGenres));
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runBpmSearch() {
    if (!hasGenreSelection()) return;
    const bpmRange = normalizeBpmRange();
    if (!bpmRange) return;
    setStatus('Loading...');
    try {
      applyResults(await apiClient.filterByBpm(selectedGenres, bpmRange));
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runKeySearch() {
    if (!hasGenreSelection()) return;
    setStatus('Loading...');
    try {
      applyResults(await apiClient.filterByKey(selectedGenres, keyValue));
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runBpmKeySearch() {
    if (!hasGenreSelection()) return;
    const bpmRange = normalizeBpmRange();
    if (!bpmRange) return;
    setStatus('Loading...');
    try {
      applyResults(await apiClient.filterByBpmKey({ genres: selectedGenres, bpmRange, key: keyValue }));
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runTextSearch(queryOverride?: string) {
    const trimmed = (queryOverride ?? query).trim();
    if (!trimmed) {
      setStatus('Enter search text.');
      return;
    }
    setStatus('Loading...');
    try {
      if (textSearchMode === 'artist') {
        applyResults(await apiClient.searchByArtist(trimmed));
      } else if (textSearchMode === 'album') {
        applyResults(await apiClient.searchByAlbum(trimmed));
      } else if (textSearchMode === 'song') {
        applyResults(await apiClient.searchBySong(trimmed));
      } else {
        applyResults(await apiClient.searchSongs(trimmed));
      }
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runCreatePlaylist(name: string) {
    setStatus('Creating...');
    try {
      const playlist = await apiClient.createPlaylist(name, selectedIds);
      if (playlist) {
        setPlaylists((prev) => [playlist, ...prev]);
        setStatus(`Created "${playlist.name}".`);
        toast.notify(`Created "${playlist.name}".`, 'success');
      } else {
        setStatus('Playlist name already exists.');
        toast.notify('Playlist name already exists.', 'error');
      }
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runAddToPlaylist(playlistId: string) {
    setStatus('Adding...');
    try {
      await apiClient.addSongsToPlaylist(playlistId, selectedIds);
      setStatus('Playlist updated.');
      toast.notify('Playlist updated.', 'success');
      if (activePlaylistId === playlistId) {
        const updated = await apiClient.showPlaylist(playlistId);
        setPlaylistSongs(updated);
      }
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runRemoveFromPlaylist() {
    if (!activePlaylistId) return;
    setStatus('Removing...');
    try {
      const updated = await apiClient.deleteFromPlaylist(activePlaylistId, selectedIds);
      if (updated) {
        setPlaylistSongs(updated.songs);
        setSelectedIds([]);
        setStatus('Songs removed.');
        toast.notify('Songs removed.', 'success');
      }
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runRenamePlaylist(newName: string) {
    if (!activePlaylistId) return;
    setStatus('Renaming...');
    try {
      const updated = await apiClient.renamePlaylist(activePlaylistId, newName);
      if (updated) {
        setPlaylists((prev) => prev.map((p) => (p._id === activePlaylistId ? updated : p)));
        setStatus('Playlist renamed.');
        toast.notify('Playlist renamed.', 'success');
      }
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runDeletePlaylist() {
    if (!activePlaylistId) return;
    setStatus('Deleting...');
    try {
      const list = await apiClient.deletePlaylist(activePlaylistId);
      setPlaylists(list);
      setActivePlaylistId(null);
      setPlaylistSongs([]);
      setSelectedIds([]);
      setStatus('Playlist deleted.');
      toast.notify('Playlist deleted.', 'success');
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runOrderChange(songTitle: string, oldOrder: number, newOrder: number) {
    if (!activePlaylistId) return;
    try {
      const updated = await apiClient.updatePlaylistOrder(
        activePlaylistId,
        songTitle,
        oldOrder,
        newOrder
      );
      if (updated) {
        setPlaylistSongs(updated.songs);
      }
    } catch (error) {
      handleApiError(error);
    }
  }

  async function runLogout() {
    setStatus('Signing out...');
    try {
      await apiClient.logout();
      setSession({ authenticated: false, user: null });
      setSongs([]);
      setPlaylists([]);
      setActivePlaylistId(null);
      setPlaylistSongs([]);
      setSelectedIds([]);
      setStatus('Signed out.');
    } catch (error) {
      handleApiError(error);
    }
  }

  return (
    <>
      <Nav session={session} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">DJ List</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search, filter, and manage playlists from your curated library.
          </p>

          <p className="mt-4 text-sm text-gray-600" role="status" aria-live="polite">
            {status}
          </p>

      {session?.authenticated ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Signed in as <strong>{session.user?.displayName || session.user?.email || 'Spotify user'}</strong>
            </p>
            <button
              type="button"
              onClick={() => void runLogout()}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>

          <div
            className="mt-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1"
            role="tablist"
            aria-label="Main views"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'songs'}
              aria-controls="songs-panel"
              id="tab-songs"
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                viewMode === 'songs'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setViewMode('songs')}
            >
              Songs
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'playlists'}
              aria-controls="playlists-panel"
              id="tab-playlists"
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                viewMode === 'playlists'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => {
                setViewMode('playlists');
                setActivePlaylistId(null);
                setPlaylistSongs([]);
              }}
            >
              Playlists
            </button>
          </div>

          <div role="tabpanel" id="songs-panel" aria-labelledby="tab-songs" hidden={viewMode !== 'songs'}>
          {viewMode === 'songs' ? (
            <>
              <GenreKeyBpmControls
                selectedGenres={selectedGenres}
                keyValue={keyValue}
                bpmMin={bpmMin}
                bpmMax={bpmMax}
                onToggleGenre={toggleGenre}
                onKeyChange={setKeyValue}
                onBpmMinChange={setBpmMin}
                onBpmMaxChange={setBpmMax}
                onSearchByGenre={() => void runGenreSearch()}
                onSearchByBpm={() => void runBpmSearch()}
                onSearchByKey={() => void runKeySearch()}
                onSearchByBpmKey={() => void runBpmKeySearch()}
              />

              <TextSearchControls
                query={query}
                mode={textSearchMode}
                onQueryChange={setQuery}
                onModeChange={setTextSearchMode}
                onSearch={(override) => void runTextSearch(override)}
              />

              <ResultsTable
                songs={songs}
                mode="search"
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </>
          ) : null}
          </div>
          <div role="tabpanel" id="playlists-panel" aria-labelledby="tab-playlists" hidden={viewMode !== 'playlists'}>
          {viewMode === 'playlists' ? (
            <PlaylistPanel
              playlists={playlists}
              activePlaylistId={activePlaylistId}
              playlistSongs={playlistSongs}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onCreatePlaylist={(name) => void runCreatePlaylist(name)}
              onShowPlaylist={(id) => {
                setActivePlaylistId(id);
                setSelectedIds([]);
              }}
              onBackToList={() => {
                setActivePlaylistId(null);
                setPlaylistSongs([]);
                setSelectedIds([]);
              }}
              onAddToPlaylist={(id) => void runAddToPlaylist(id)}
              onRemoveFromPlaylist={() => void runRemoveFromPlaylist()}
              onRenamePlaylist={(name) => void runRenamePlaylist(name)}
              onDeletePlaylist={() => void runDeletePlaylist()}
              onOrderChange={(title, oldO, newO) => void runOrderChange(title, oldO, newO)}
              status={status}
              onStatusChange={setStatus}
            />
          ) : null}
          </div>
        </>
      ) : (
        <a
          href="/auth/spotify"
          className="mt-4 inline-flex items-center rounded-lg border border-green-600 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Sign In with Spotify
        </a>
      )}
        </div>
      </main>
    </>
  );
}

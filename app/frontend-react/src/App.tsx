import { useState } from 'react';
import { apiClient } from './api/client';
import { ApiClientError } from './api/http';
import type { Song } from './types/models';

export function App() {
  const [query, setQuery] = useState('James Brown');
  const [songs, setSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<string | null>(null);

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

  return (
    <main className="app-shell">
      <h1>DJ List</h1>
      <p>React + TypeScript foundation with a typed API client.</p>
      <p className="hint">This shell can call existing backend endpoints without backend changes.</p>

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
      </div>

      {status ? <p className="status">{status}</p> : null}
      {songs.length > 0 ? (
        <ul className="results">
          {songs.map((song) => (
            <li key={song._id}>
              {song.Artist} - {song.Song}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}

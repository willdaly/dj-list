import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../api/client';

export type TextSearchMode = 'smart' | 'artist' | 'album' | 'song';

interface TextSearchControlsProps {
  query: string;
  mode: TextSearchMode;
  onQueryChange: (query: string) => void;
  onModeChange: (mode: TextSearchMode) => void;
  onSearch: (queryOverride?: string) => void;
}

const inputBase =
  'min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const btnPrimary =
  'rounded-md border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

const SUGGEST_MIN_LENGTH = 2;
const DEBOUNCE_MS = 200;

export function TextSearchControls(props: TextSearchControlsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback((typed: string) => {
    if (typed.length < SUGGEST_MIN_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    apiClient
      .guessArtistNames(typed)
      .then((artists) => {
        setSuggestions(artists);
        setShowSuggestions(artists.length > 0);
      })
      .catch(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(props.query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [props.query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSuggestionClick(artist: string) {
    props.onQueryChange(artist);
    setShowSuggestions(false);
    if (props.mode === 'artist') {
      props.onSearch(artist);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50/50 p-5 first:mt-0">
      <h2 className="text-base font-semibold text-gray-900">Text Search</h2>
      <p className="mt-1 text-sm text-gray-500">
        Run smart search or target Artist / Album / Song explicitly.
      </p>

      <div ref={containerRef} className="relative mt-4 flex flex-wrap items-end gap-3">
        <label className="relative flex flex-1 min-w-[140px] flex-col gap-1.5 text-sm font-medium text-gray-700">
          <span className="sr-only">Search</span>
          <input
            type="search"
            value={props.query}
            onChange={(event) => props.onQueryChange(event.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && props.onSearch()}
            onFocus={() => props.query.trim().length >= SUGGEST_MIN_LENGTH && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Artist, Album, Song"
            className={inputBase}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full z-10 mt-0.5 max-h-48 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              role="listbox"
            >
              {suggestions.map((artist) => (
                <li
                  key={artist}
                  role="option"
                  className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-gray-100"
                  onClick={() => handleSuggestionClick(artist)}
                >
                  {artist}
                </li>
              ))}
            </ul>
          )}
          {loading && props.query.trim().length >= SUGGEST_MIN_LENGTH && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</span>
          )}
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          <span className="sr-only">Search mode</span>
          <select
            value={props.mode}
            onChange={(event) => props.onModeChange(event.target.value as TextSearchMode)}
            className={`${inputBase} w-full sm:w-auto`}
          >
            <option value="smart">Smart</option>
            <option value="artist">Artist</option>
            <option value="album">Album</option>
            <option value="song">Song</option>
          </select>
        </label>

        <button type="button" className={btnPrimary} onClick={() => props.onSearch()}>
          Search
        </button>
      </div>
    </section>
  );
}

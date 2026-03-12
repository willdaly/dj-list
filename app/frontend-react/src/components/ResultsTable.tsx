import { useCallback, useEffect, useRef } from 'react';
import Sortable, { type SortableEvent } from 'sortablejs';
import type { Song } from '../types/models';

export type ResultsTableMode = 'search' | 'playlist';

interface ResultsTableProps {
  songs: Song[];
  mode?: ResultsTableMode;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onOrderChange?: (songTitle: string, oldOrder: number, newOrder: number) => void;
}

function useSortable(
  tableBodyRef: React.RefObject<HTMLTableSectionElement | null>,
  enabled: boolean,
  onOrderChange: (songTitle: string, oldOrder: number, newOrder: number) => void
) {
  const sortableRef = useRef<Sortable | null>(null);

  useEffect(() => {
    if (!enabled || !tableBodyRef.current) {
      return;
    }

    sortableRef.current = Sortable.create(tableBodyRef.current, {
      handle: '.order-cell',
      animation: 150,
      onEnd(evt: SortableEvent) {
        const row = evt.item;
        const newOrder = (evt.newIndex ?? 0) + 1;
        const oldOrder = Number(row.getAttribute('data-order')) || 1;
        const title = row.querySelector('[data-song-title]')?.textContent ?? '';
        if (title) {
          onOrderChange(title, oldOrder, newOrder);
        }
      }
    });

    return () => {
      sortableRef.current?.destroy();
      sortableRef.current = null;
    };
  }, [enabled, tableBodyRef, onOrderChange]);
}

export function ResultsTable(props: ResultsTableProps) {
  const {
    songs,
    mode = 'search',
    selectedIds = [],
    onSelectionChange,
    onOrderChange
  } = props;

  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const isPlaylist = mode === 'playlist';

  const handleOrderChange = useCallback(
    (songTitle: string, oldOrder: number, newOrder: number) => {
      onOrderChange?.(songTitle, oldOrder, newOrder);
    },
    [onOrderChange]
  );

  useSortable(tbodyRef, isPlaylist && songs.length > 0 && !!onOrderChange, handleOrderChange);

  function handleRowClick(e: React.MouseEvent<HTMLTableRowElement>, songId: string) {
    if (!onSelectionChange) return;
    if ((e.target as HTMLElement).closest('.order-cell')) return;

    const multi = e.metaKey || e.ctrlKey;
    if (multi) {
      const next = selectedIds.includes(songId)
        ? selectedIds.filter((id) => id !== songId)
        : [...selectedIds, songId];
      onSelectionChange(next);
    } else {
      onSelectionChange(selectedIds.includes(songId) ? [] : [songId]);
    }
  }

  function handleRowKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>, songId: string) {
    if (!onSelectionChange || e.target !== e.currentTarget) return;
    if ((e.target as HTMLElement).closest('.order-cell')) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const multi = e.metaKey || e.ctrlKey;
      if (multi) {
        const next = selectedIds.includes(songId)
          ? selectedIds.filter((id) => id !== songId)
          : [...selectedIds, songId];
        onSelectionChange(next);
      } else {
        onSelectionChange(selectedIds.includes(songId) ? [] : [songId]);
      }
    }
  }

  if (songs.length === 0) {
    return null;
  }

  const sortedSongs = isPlaylist
    ? [...songs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : songs;

  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50/50 p-5 first:mt-0">
      <h2 className="text-base font-semibold text-gray-900">Results</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {isPlaylist && (
                <th className="w-12 bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-500">
                  #
                </th>
              )}
              <th className="bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-500">
                BPM
              </th>
              <th className="bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-500">
                Key
              </th>
              <th className="bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-500">
                Song
              </th>
              <th className="bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-500">
                Artist
              </th>
              <th className="bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-500">
                Album
              </th>
              <th className="bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-500">
                Genre
              </th>
            </tr>
          </thead>
          <tbody ref={tbodyRef} className="divide-y divide-gray-100">
            {sortedSongs.map((song) => {
              const selected = selectedIds.includes(song._id);
              return (
                <tr
                  key={song._id}
                  onClick={(e) => handleRowClick(e, song._id)}
                  onKeyDown={(e) => handleRowKeyDown(e, song._id)}
                  tabIndex={onSelectionChange ? 0 : undefined}
                  role={onSelectionChange ? 'button' : undefined}
                  data-order={song.order}
                  className={`cursor-pointer transition-colors ${
                    selected ? 'bg-red-50' : 'hover:bg-gray-50'
                  } focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset`}
                >
                  {isPlaylist && (
                    <td className="order-cell px-3 py-2 text-sm" data-order={song.order}>
                      {song.order ?? '-'}
                    </td>
                  )}
                  <td className="px-3 py-2 text-sm text-gray-600">{song.BPM}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{song.Key}</td>
                  <td className="px-3 py-2 text-sm" data-song-title={song.Song}>
                    {song.Song}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{song.Artist}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{song.Album}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{song.genre}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

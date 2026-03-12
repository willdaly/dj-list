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

  if (songs.length === 0) {
    return null;
  }

  const sortedSongs = isPlaylist
    ? [...songs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : songs;

  return (
    <section className="panel">
      <h2>Results</h2>
      <div className="results-wrap">
        <table className="results-table">
          <thead>
            <tr>
              {isPlaylist && <th className="order-col">#</th>}
              <th>BPM</th>
              <th>Key</th>
              <th>Song</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Genre</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {sortedSongs.map((song) => {
              const selected = selectedIds.includes(song._id);
              return (
                <tr
                  key={song._id}
                  className={selected ? 'selected' : ''}
                  onClick={(e) => handleRowClick(e, song._id)}
                  data-order={song.order}
                >
                  {isPlaylist && (
                    <td className="order-cell" data-order={song.order}>
                      {song.order ?? '-'}
                    </td>
                  )}
                  <td>{song.BPM}</td>
                  <td>{song.Key}</td>
                  <td data-song-title={song.Song}>{song.Song}</td>
                  <td>{song.Artist}</td>
                  <td>{song.Album}</td>
                  <td>{song.genre}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

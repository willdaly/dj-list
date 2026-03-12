import { useState } from 'react';
import { apiClient } from '../api/client';
import type { Playlist, Song } from '../types/models';
import { ResultsTable } from './ResultsTable';

interface PlaylistPanelProps {
  playlists: Playlist[];
  activePlaylistId: string | null;
  playlistSongs: Song[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCreatePlaylist: (name: string) => void;
  onShowPlaylist: (id: string) => void;
  onBackToList: () => void;
  onAddToPlaylist: (playlistId: string) => void;
  onRemoveFromPlaylist: () => void;
  onRenamePlaylist: (newName: string) => void;
  onDeletePlaylist: () => void;
  onOrderChange: (songTitle: string, oldOrder: number, newOrder: number) => void;
  onPreviewFetched?: (song: Song) => void;
  status: string;
  onStatusChange: (msg: string) => void;
}

const inputBase =
  'min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const btnPrimary =
  'rounded-md border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

const btnSecondary =
  'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

const btnDanger =
  'rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2';

const btnLink =
  'flex-1 rounded-md bg-transparent px-0 py-1 text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

export function PlaylistPanel(props: PlaylistPanelProps) {
  const {
    playlists,
    activePlaylistId,
    playlistSongs,
    selectedIds,
    onSelectionChange,
    onCreatePlaylist,
    onShowPlaylist,
    onBackToList,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    onRenamePlaylist,
    onDeletePlaylist,
    onOrderChange,
    onPreviewFetched,
    status,
    onStatusChange
  } = props;

  const [createName, setCreateName] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const activePlaylist = activePlaylistId
    ? playlists.find((p) => p._id === activePlaylistId)
    : null;

  function handleCreate() {
    const name = createName.trim();
    if (name.length < 4) {
      onStatusChange('Playlist name must be at least 4 characters.');
      return;
    }
    if (selectedIds.length === 0) {
      onStatusChange('Select at least one song.');
      return;
    }
    onCreatePlaylist(name);
    setCreateName('');
  }

  function handleAddTo(id: string) {
    if (selectedIds.length === 0) {
      onStatusChange('Select at least one song.');
      return;
    }
    onAddToPlaylist(id);
  }

  function handleRemove() {
    if (selectedIds.length === 0) {
      onStatusChange('Select at least one song to remove.');
      return;
    }
    onRemoveFromPlaylist();
  }

  function handleRename() {
    const name = renameValue.trim();
    if (name.length < 4) {
      onStatusChange('Playlist name must be at least 4 characters.');
      return;
    }
    onRenamePlaylist(name);
    setRenameValue('');
  }

  function handleDelete() {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    onDeletePlaylist();
  }

  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50/50 p-5 first:mt-0">
      <h2 className="text-base font-semibold text-gray-900">Playlists</h2>
      <p className="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
        {status}
      </p>

      {activePlaylistId ? (
        <div className="mt-4">
          <button
            type="button"
            className={btnSecondary}
            onClick={onBackToList}
          >
            ← Back to list
          </button>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {activePlaylist?.name ?? 'Playlist'}
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="New name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className={inputBase}
              aria-label="New playlist name"
            />
            <button type="button" className={btnPrimary} onClick={handleRename}>
              Rename
            </button>
            <button type="button" className={btnSecondary} onClick={handleRemove}>
              Remove selected
            </button>
            <button type="button" className={btnDanger} onClick={handleDelete}>
              Delete playlist
            </button>
          </div>
          <ResultsTable
            songs={playlistSongs}
            mode="playlist"
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            onOrderChange={onOrderChange}
            onFetchPreview={
              onPreviewFetched
                ? async (songId) => {
                    try {
                      const song = await apiClient.fetchPreview(songId);
                      onPreviewFetched(song);
                      return song;
                    } catch {
                      return null;
                    }
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Check songs above, enter name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className={inputBase}
              aria-label="New playlist name"
            />
            <button type="button" className={btnPrimary} onClick={handleCreate}>
              Create Playlist
            </button>
          </div>

          <ul className="mt-4 list-none divide-y divide-gray-200 p-0">
            {playlists.map((p) => (
              <li
                key={p._id}
                className="flex items-center gap-3 py-3 first:pt-0"
              >
                <button
                  type="button"
                  className={btnLink}
                  onClick={() => onShowPlaylist(p._id)}
                >
                  {p.name}
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => handleAddTo(p._id)}
                >
                  Add songs
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

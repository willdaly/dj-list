import { useState } from 'react';
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
  status: string;
  onStatusChange: (msg: string) => void;
}

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
    <section className="panel playlist-panel">
      <h2>Playlists</h2>
      <p className="status">{status}</p>

      {activePlaylistId ? (
        <div className="playlist-view">
          <button type="button" className="secondary" onClick={onBackToList}>
            ← Back to list
          </button>
          <h3>{activePlaylist?.name ?? 'Playlist'}</h3>
          <div className="playlist-actions">
            <input
              placeholder="New name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
            <button type="button" onClick={handleRename}>
              Rename
            </button>
            <button type="button" onClick={handleRemove}>
              Remove selected
            </button>
            <button type="button" className="danger" onClick={handleDelete}>
              Delete playlist
            </button>
          </div>
          <ResultsTable
            songs={playlistSongs}
            mode="playlist"
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            onOrderChange={onOrderChange}
          />
        </div>
      ) : (
        <>
          <div className="create-playlist-form">
            <input
              placeholder="Check songs above, enter name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
            <button type="button" onClick={handleCreate}>
              Create Playlist
            </button>
          </div>

          <ul className="playlist-list">
            {playlists.map((p) => (
              <li key={p._id} className="playlist-item">
                <button type="button" className="link" onClick={() => onShowPlaylist(p._id)}>
                  {p.name}
                </button>
                <button type="button" onClick={() => handleAddTo(p._id)}>
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

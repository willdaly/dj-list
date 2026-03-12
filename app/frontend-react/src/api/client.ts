import type { Playlist, SessionState, Song } from '../types/models';
import {
  artistSuggestionsResponseSchema,
  playlistResponseSchema,
  playlistsResponseSchema,
  sessionStateSchema,
  songsResponseSchema
} from '../types/schemas';
import { request } from './http';

export interface SearchFilters {
  genres: string[];
  bpmRange: [number, number];
  key: string;
}

export const apiClient = {
  session(): Promise<SessionState> {
    return request({ method: 'GET', path: '/api/session', schema: sessionStateSchema });
  },

  searchSongs(query: string): Promise<Song[]> {
    return request({ method: 'POST', path: '/search', data: { query }, schema: songsResponseSchema }).then(
      (response) => response.songs
    );
  },

  searchByArtist(artist: string): Promise<Song[]> {
    return request({
      method: 'POST',
      path: '/artistSearch',
      data: { Artist: artist },
      schema: songsResponseSchema
    }).then((response) => response.songs);
  },

  searchByAlbum(album: string): Promise<Song[]> {
    return request({
      method: 'POST',
      path: '/albumSearch',
      data: { Album: album },
      schema: songsResponseSchema
    }).then((response) => response.songs);
  },

  searchBySong(song: string): Promise<Song[]> {
    return request({
      method: 'POST',
      path: '/songSearch',
      data: { Song: song },
      schema: songsResponseSchema
    }).then((response) => response.songs);
  },

  guessArtistNames(typed: string): Promise<string[]> {
    return request({
      method: 'POST',
      path: '/guessSearch',
      data: { typed },
      schema: artistSuggestionsResponseSchema
    }).then((response) => response.artists);
  },

  filterByGenre(genres: string[]): Promise<Song[]> {
    return request({
      method: 'POST',
      path: '/genreFilter',
      data: { genre: genres },
      schema: songsResponseSchema
    }).then((response) => response.songs);
  },

  filterByBpm(genres: string[], bpmRange: [number, number]): Promise<Song[]> {
    return request({
      method: 'POST',
      path: '/bpm',
      data: { genre: genres, BPM: bpmRange },
      schema: songsResponseSchema
    }).then((response) => response.songs);
  },

  filterByKey(genres: string[], key: string): Promise<Song[]> {
    return request({
      method: 'POST',
      path: '/key',
      data: { genre: genres, Key: key },
      schema: songsResponseSchema
    }).then((response) => response.songs);
  },

  filterByBpmKey(filters: SearchFilters): Promise<Song[]> {
    return request({
      method: 'POST',
      path: '/bpmKey',
      data: { genre: filters.genres, BPM: filters.bpmRange, Key: filters.key },
      schema: songsResponseSchema
    }).then((response) => response.songs);
  },

  listPlaylists(): Promise<Playlist[]> {
    return request({ method: 'POST', path: '/playlists', schema: playlistsResponseSchema }).then(
      (response) => response.playlists
    );
  },

  showPlaylist(playlistId: string): Promise<Song[]> {
    return request({
      method: 'POST',
      path: `/playlists/${playlistId}`,
      schema: songsResponseSchema
    }).then((response) => response.songs);
  },

  createPlaylist(name: string, songIds: string[]): Promise<Playlist | null> {
    return request({
      method: 'POST',
      path: '/createPlaylist',
      data: { name, songIds },
      schema: playlistResponseSchema
    }).then((response) => response.playlist);
  },

  addSongsToPlaylist(playlistId: string, songIds: string[]): Promise<Playlist | null> {
    return request({
      method: 'PUT',
      path: '/addToPlaylist',
      data: { playlistId, songIds },
      schema: playlistResponseSchema
    }).then((response) => response.playlist);
  },

  renamePlaylist(playlistId: string, newName: string): Promise<Playlist | null> {
    return request({
      method: 'PUT',
      path: '/renamePlaylist',
      data: { playlistId, newName },
      schema: playlistResponseSchema
    }).then((response) => response.playlist);
  },

  deleteFromPlaylist(playlistId: string, songIds: string[]): Promise<Playlist | null> {
    return request({
      method: 'POST',
      path: '/deleteFromPlaylist',
      data: { playlistId, songIds },
      schema: playlistResponseSchema
    }).then((response) => response.playlist);
  },

  deletePlaylist(playlistId: string): Promise<Playlist[]> {
    return request({
      method: 'DELETE',
      path: `/deletePlaylist/${playlistId}`,
      schema: playlistsResponseSchema
    }).then((response) => response.playlists);
  },

  logout(): Promise<void> {
    return request({ method: 'POST', path: '/logout' });
  }
};

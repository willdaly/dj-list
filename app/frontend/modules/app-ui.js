import { initSlider } from './slider';
import {
  guessSearch,
  key,
  bpm,
  bpmKey,
  artistSearch,
  albumSearch,
  songSearch,
  genreFilter,
  transpose
} from './search-actions';
import {
  songsControls,
  createPlaylist,
  getplaylistindex,
  showPlaylist,
  addToPlaylist,
  renamePlaylist,
  deleteFromPlaylist,
  deletePlaylist
} from './playlist-actions';
import { createSong, editSongShow, editSong } from './song-actions';
import { initGenreSelection, initResultSelection } from './ui-common';

function controlsToggle() {
  $('.container').toggle();
  $('.nav.nav-pills.nav-justified').toggle();
}

export function initApp() {
  initSlider();
  initGenreSelection();
  initResultSelection();
  $('#controlsToggle').click(controlsToggle);

  $('#createNewSong').click(createSong);
  $('#keyFilter').click(key);
  $('#bpmFilter').click(bpm);
  $('#bpmKeyFilter').click(bpmKey);
  $('#artistSearch').click(artistSearch);
  $('#albumSearch').click(albumSearch);
  $('#songSearch').click(songSearch);
  $('#genreFilter').click(genreFilter);
  $('.transpose').click(transpose);
  $('#songsButton').click(songsControls);
  $('#editSongBtn').click(editSongShow);
  $('#editSongSubmit').click(editSong);

  $('#createPlaylist').click(createPlaylist);
  $('#playlistsButton').click(getplaylistindex);
  $('#playlists').on('click', 'a', showPlaylist);
  $('#playlists').on('click', 'button', addToPlaylist);
  $('#renamePlaylist').click(renamePlaylist);
  $('#deleteFromPlaylist').click(deleteFromPlaylist);
  $('.playlistsShow').on('click', '#deletePlaylist', deletePlaylist);
  $('#searchInput').keyup(guessSearch);
}

import { initSlider } from './slider';
import {
  guessSearch,
  key,
  bpm,
  bpmKey,
  search,
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

  $('#keyFilter').click(key);
  $('#bpmFilter').click(bpm);
  $('#bpmKeyFilter').click(bpmKey);
  $('#searchButton').click(search);
  $('#genreFilter').click(genreFilter);
  $('.transpose').click(transpose);
  $('#songsButton').click(songsControls);

  $('#createPlaylist').click(createPlaylist);
  $('#playlistsButton').click(getplaylistindex);
  $('#playlists').on('click', 'a', showPlaylist);
  $('#playlists').on('click', 'button', addToPlaylist);
  $('#renamePlaylist').click(renamePlaylist);
  $('#deleteFromPlaylist').click(deleteFromPlaylist);
  $('.playlistsShow').on('click', '#deletePlaylist', deletePlaylist);
  $('#searchInput').keyup(guessSearch);
}

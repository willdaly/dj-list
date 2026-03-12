import { ajax } from './api';
import { getBpmRange } from './slider';
import { appendSearchResults } from './ui-results';
import { getSelectedGenres } from './ui-common';

function ensureSuggestionList() {
  if ($('#searchSuggestions').length === 0) {
    $('#searchInput').attr('list', 'searchSuggestions');
    $('#searchInput').after('<datalist id="searchSuggestions"></datalist>');
  }
}

export function guessSearch() {
  var typed = $('#searchInput').val();
  if (typed.length > 3) {
    $.ajax({
      url: '/guessSearch',
      type: 'POST',
      data: { typed: typed },
      success: (response) => {
        ensureSuggestionList();
        var uniqueArtists = Array.from(new Set(response.artists || []));
        $('#searchSuggestions').empty();
        uniqueArtists.forEach((artist) => {
          $('#searchSuggestions').append($('<option>').attr('value', artist));
        });
      }
    });
  }
}

export function songSearch(e) {
  var song = $('#searchInput').val();
  if (song.length > 0) {
    ajax('/songSearch', 'POST', { Song: song }, (response) => {
      appendSearchResults(response.songs);
    });
  }
  e.preventDefault();
}

export function search(e) {
  var query = $('#searchInput').val();
  if (query.length > 0) {
    ajax('/search', 'POST', { query: query }, (response) => {
      appendSearchResults(response.songs);
    });
  }
  e.preventDefault();
}

export function albumSearch(e) {
  var album = $('#searchInput').val();
  if (album.length > 0) {
    ajax('/albumSearch', 'POST', { Album: album }, (response) => {
      appendSearchResults(response.songs);
    });
  }
  e.preventDefault();
}

export function artistSearch(e) {
  var searchInput = $('#searchInput').val();
  if (searchInput.length > 0) {
    ajax('/artistSearch', 'POST', { Artist: searchInput }, (response) => {
      appendSearchResults(response.songs);
    });
  }
  e.preventDefault();
}

export function genreFilter(e) {
  var genres = getSelectedGenres();
  ajax('/genreFilter', 'POST', { genre: genres }, (response) => {
    appendSearchResults(response.songs);
  });
  e.preventDefault();
}

export function transpose() {
  var trans = $(this).parent().val();
  var lowBpm = getBpmRange()[0];
  var keyValue = $('#key').val();
  $.ajax({
    url: '/transpose',
    type: 'POST',
    data: { trans: trans, BPM: lowBpm, Key: keyValue, genre: getSelectedGenres() },
    success: (response) => {
      appendSearchResults(response.songs);
    }
  });
}

export function key(e) {
  var genres = getSelectedGenres();
  var data = $('#key').val();
  ajax('/key', 'POST', { Key: data, genre: genres }, (response) => {
    appendSearchResults(response.songs);
  });
  e.preventDefault();
}

export function bpm(e) {
  var genres = getSelectedGenres();
  var range = getBpmRange();
  $.ajax({
    url: '/bpm',
    type: 'POST',
    data: { BPM: [range[0], range[1]], genre: genres },
    success: (response) => {
      appendSearchResults(response.songs);
    }
  });
  e.preventDefault();
}

export function bpmKey(e) {
  var genres = getSelectedGenres();
  var keyValue = $('#key').val();
  var range = getBpmRange();
  $.ajax({
    url: '/bpmKey',
    type: 'POST',
    data: { BPM: [range[0], range[1]], Key: keyValue, genre: genres },
    success: (response) => {
      appendSearchResults(response.songs);
    }
  });
  e.preventDefault();
}

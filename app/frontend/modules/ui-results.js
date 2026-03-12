import Sortable from 'sortablejs';
import { showMessage } from './ui-common';

var resultsSortable = null;

function hideAlbumColumn() {
  if ($('.albumTd:empty').length === $('#searchResults  > tr').length) {
    $('.albumTd:empty').hide();
    $('#albumTh').hide();
  }
}

function updateOrder(e, title, oldOrder, newOrder) {
  var playlistId = $('.list-group-item:visible').attr('id');
  $.ajax({
    url: `/updateOrder/${playlistId}`,
    type: 'PUT',
    data: { songTitle: title, oldOrder: oldOrder, newOrder: newOrder },
    success: (response) => {
      appendPlaylistSongs(response.playlist.songs);
    }
  });
  e.preventDefault();
}

export function appendSearchResults(songs) {
  if (resultsSortable) {
    resultsSortable.destroy();
    resultsSortable = null;
  }

  if (songs.length > 0) {
    $('#searchResults').empty();
    $('#orderTableHead').hide();
    if ($('#albumTh').not(':visible')) {
      $('#albumTh').show();
    }
    songs.forEach((song) => {
      $('#searchResults').append(`<tr id=${song._id}><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td class='albumTd'>${song.Album}</td><td>${song.genre}</td></tr>`);
    });
    hideAlbumColumn();
  } else {
    showMessage('didn\'t find anything');
  }
}

export function appendPlaylistSongs(songs) {
  if (songs.length > 0) {
    $('#searchResults').empty();
    if ($('#albumTh').not(':visible')) {
      $('#albumTh').show();
    }
    songs.forEach((song) => {
      $('#searchResults').append(`<tr value=${song.order} id=${song._id}><td class='order'>${song.order}</td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td class='albumTd'>${song.Album}</td><td>${song.genre}</td></tr>`);
    });

    if (resultsSortable) {
      resultsSortable.destroy();
    }

    resultsSortable = Sortable.create(document.getElementById('searchResults'), {
      handle: '.order',
      animation: 150,
      onEnd: function(evt) {
        var row = evt.item;
        var newOrder = evt.newIndex + 1;
        var oldOrder = row.getAttribute('value');
        var title = row.children[3].innerText;
        updateOrder(evt, title, oldOrder, newOrder);
      }
    });

    hideAlbumColumn();
  }
}

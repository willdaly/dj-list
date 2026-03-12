import { bindSelectableRows, showMessage } from './ui-common';

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
  if (songs.length > 0) {
    $('#searchResults').empty();
    $('#orderTableHead').hide();
    if ($('#albumTh').not(':visible')) {
      $('#albumTh').show();
    }
    songs.forEach((song) => {
      $('#searchResults').append(`<tr id=${song._id}><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td class='albumTd'>${song.Album}</td><td>${song.genre}</td></tr>`);
      bindSelectableRows();
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
      $('#searchResults').append(`<tr value=${song.order} class='ui-corner-all', id=${song._id}><td class='order'>${song.order}</td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td class='albumTd'>${song.Album}</td><td>${song.genre}</td></tr>`);
      bindSelectableRows();
    });
    $('#searchResults').sortable({
      handle: '.order',
      update: function(event, ui) {
        var newOrder = ui.item.context.rowIndex;
        var oldOrder = ui.item.attr('value');
        var title = ui.item.context.children[3].innerText;
        updateOrder(event, title, oldOrder, newOrder);
      }
    });
    $('#searchResults').selectable({ filter: 'tr', cancel: '.order' });
    hideAlbumColumn();
  }
}

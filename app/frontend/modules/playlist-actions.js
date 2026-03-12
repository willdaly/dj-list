import { appendPlaylistSongs } from './ui-results';
import { getSelectedSongIds, showMessage } from './ui-common';

export function renamePlaylist() {
  var newName = $('#editPlaylistName').val();
  if (newName.length > 3) {
    var id = $('.list-group-item:visible').attr('id');
    $.ajax({
      url: '/renamePlaylist',
      type: 'put',
      data: { newName: newName, playlistId: id },
      success: () => {
        $('.list-group-item:visible a').text(newName);
      }
    });
  } else {
    showMessage('name blank or too short');
  }
}

export function showPlaylist() {
  var playlistId = $(this).parent().attr('id');
  $.ajax({
    url: `/playlists/${playlistId}`,
    type: 'POST',
    data: null,
    success: (response) => {
      $('.songs').hide();
      $('.playlistsIndex').hide();
      $('ul#playlists.list-group li a').not(this).parent().remove();
      $('.playlistsShow').show();
      $('#searchResults').empty();
      $('#orderTableHead').show();
      appendPlaylistSongs(response.songs);
    }
  });
}

export function songsControls() {
  $('ul#playlists.list-group').empty();
  $('#songsButton').parent().addClass('active');
  $('#playlistsButton').parent().removeClass('active');
  $('.playlistsIndex').hide();
  $('.playlistsShow').hide();
  $('#orderTableHead').hide();
  $('.order').hide();
  $('.songs').show();
}

export function createPlaylist(e) {
  var songIdsArray = getSelectedSongIds();
  var name = $('#name').val();
  if (name.length > 3) {
    $.ajax({
      url: '/createPlaylist',
      type: 'POST',
      data: { songIds: songIdsArray, name: name },
      success: (response) => {
        $('#playlists').prepend(`<li class='list-group-item clearfix' id=${response.playlist._id}><a data-target='#'>${response.playlist.name}</a><button class='btn pull-right'>add songs</button></li>`);
      }
    });
  } else {
    showMessage(' playlist name is blank or too short.');
  }
  e.preventDefault();
}

export function addToPlaylist() {
  var songIdsArray = getSelectedSongIds();
  if (songIdsArray) {
    var id = $(this).parent().attr('id');
    $.ajax({
      url: '/addToPlaylist',
      type: 'put',
      data: { songIds: songIdsArray, playlistId: id },
      success: () => {
        showMessage('playlist updated');
      }
    });
  }
}

export function deletePlaylist() {
  var id = $('.list-group-item:visible').attr('id');
  var sure = confirm('are you sure you want to delete this playlist?');
  if (sure) {
    $.ajax({
      url: `/deletePlaylist/${id}`,
      type: 'DELETE',
      data: null,
      success: () => {
        $('#searchResults').empty();
        getplaylistindex();
      }
    });
  }
}

export function getplaylistindex() {
  $('#songsButton').parent().removeClass('active');
  $('#playlistsButton').parent().addClass('active');
  $('.list-group-item:visible').remove();
  $('#orderTableHead').hide();
  $('.order').hide();
  $.ajax({
    url: '/playlists',
    type: 'POST',
    data: null,
    success: (response) => {
      $('.songs').hide();
      $('.playlistsShow').hide();
      $('.playlistsIndex').show();
      if (response.playlists.length > 0) {
        $('#playlistId').empty();
        $('#playlistId').append('<option>select songs, playlist</option>');
        response.playlists.forEach((playlist) => {
          $('#playlists').append(`<li class='list-group-item clearfix' id=${playlist._id}><a data-target='#'>${playlist.name}</a><button class='btn pull-right'>add songs</button></li>`);
        });
      }
    }
  });
}

export function deleteFromPlaylist(e) {
  var songIdsArray = getSelectedSongIds();
  var playlistId = $('.list-group-item:visible').attr('id');
  $.ajax({
    url: '/deleteFromPlaylist',
    type: 'POST',
    data: { songIds: songIdsArray, playlistId: playlistId },
    success: (response) => {
      appendPlaylistSongs(response.playlist.songs);
    }
  });
  e.preventDefault();
}

import { noSongSelected, showModalHeaderMessage, showMessage } from './ui-common';

export function editSongShow() {
  if ($('#searchResults .is-selected').length > 0) {
    $('#searchResults .is-selected:gt(0)').removeClass('is-selected');
    var id = $('#searchResults .is-selected:nth(0)').attr('id');
    var bpm = $('#searchResults .is-selected:nth(0) td:nth(0)').text();
    var key = $('#searchResults .is-selected:nth(0) td:nth(1)').text();
    var title = $('#searchResults .is-selected:nth(0) td:nth(2)').text();
    var artist = $('#searchResults .is-selected:nth(0) td:nth(3)').text();
    var album = $('#searchResults .is-selected:nth(0) td:nth(4)').text();
    var genre = $('#searchResults .is-selected:nth(0) td:nth(5)').text();
    $('#editSongBPM').val(bpm);
    $('#editSongKey').val(key);
    $('#editSongTitle').val(title);
    $('#editSongArtist').val(artist);
    $('#editSongAlbum').val(album);
    $('#editsongGenre').val(genre);
    $('#songId').val(id);
    $('#editSong').modal('show');
  } else {
    noSongSelected();
  }
}

export function editSong(e) {
  var id = $('#songId').val();
  var bpm = $('#editSongBPM').val().length > 0 ? $('#editSongBPM').val() : null;
  var keyValue = $('#editSongKey').val().length > 0 ? $('#editSongKey').val() : null;
  var title = $('#editSongTitle').val().length > 0 ? $('#editSongTitle').val() : null;
  var artist = $('#editSongArtist').val().length > 0 ? $('#editSongArtist').val() : null;
  var album = $('#editSongAlbum').val().length > 0 ? $('#editSongAlbum').val() : null;
  var genre = $('#editSongGenre').val().length > 0 ? $('#editsongGenre').val() : null;
  $.ajax({
    url: '/editSong',
    type: 'put',
    data: { Id: id, BPM: bpm, Key: keyValue, Title: title, Artist: artist, Album: album, genre: genre },
    success: (response) => {
      $('#editSong').modal('hide');
      showMessage(`${response.song.Song} updated`);
    }
  });
  e.preventDefault();
}

export function createSong(e) {
  var bpm = $('#newSongBPM').val();
  var keyValue = $('#newSongKey').val();
  var title = $('#newSongName').val();
  var artist = $('#newSongArtist').val();
  var album = $('#newSongAlbum').val();
  var genre = $('#newSongGenre').val();
  if (title !== '' && artist !== '') {
    $.ajax({
      url: '/createSong',
      type: 'POST',
      data: { BPM: bpm, Key: keyValue, Title: title, Artist: artist, Album: album, genre: genre },
      success: () => {
        $('#createSong').modal('hide');
      }
    });
  } else {
    showModalHeaderMessage('must enter an artist and title to add a song');
  }

  e.preventDefault();
}

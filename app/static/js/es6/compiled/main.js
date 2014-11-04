(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    displaySlider();
    $('#keyFilter').click(key);
    $('#bpmFilter').click(bpm);
    $('#bpmKeyFilter').click(bpmKey);
    $('#artistSearch').click(artistSearch);
    $('#albumSearch').click(albumSearch);
    $('#songSearch').click(songSearch);
    $('#genreFilter').click(genreFilter);
    $('.transpose').click(transpose);
    $('#createNewSong').click(createSong);
    $('#createPlaylist').click(createPlaylist);
    $('#addToPlaylist').click(addToPlaylist);
    $('.playlistsShow').on('click', '#deletePlaylist', deletePlaylist);
    $('#deleteFromPlaylist').click(deleteFromPlaylist);
    $('#songsButton').click(songsControls);
    $('#songsButton').click(songsControls);
    $('#playlistsButton').click(getplaylistindex);
    $('#playlists').on('click', 'li', showPlaylist);
    $('.genres').bind('mousedown', (function(e) {
      e.metaKey = true;
    })).selectable();
    $('#controlsToggle').click(controlsToggle);
  }
  function controlsToggle() {
    $('.container').toggle();
    $('.nav.nav-pills.nav-justified').toggle();
  }
  function showPlaylist() {
    var $__0 = this;
    var playlistId = $(this).attr('id');
    $.ajax({
      url: ("/playlists/" + playlistId),
      type: 'POST',
      data: null,
      success: (function(response) {
        $('.songs').hide();
        $('.playlistsIndex').hide();
        $('ul#playlists.list-group li').not($__0).remove();
        $('.playlistsShow').toggle();
        $('#searchResults').empty();
        $('#orderTableHead').show();
        appendPlaylistSongs(response.songs);
      })
    });
  }
  function songsControls() {
    $('ul#playlists.list-group').empty();
    $('#songsButton').parent().addClass('active');
    $('#playlistsButton').parent().removeClass('active');
    $('.playlistsIndex').hide();
    $('.playlistsShow').hide();
    $('#orderTableHead').hide();
    $('.order').hide();
    $('.songs').show();
    if ($('.ui-sortable-handle').length !== 0) {
      $('.ui-sortable-handle').hide();
    }
  }
  function selectSongsToAdd() {
    var fakeArray = $('tr.ui-selectee.ui-selected');
    var realArray = $.makeArray(fakeArray);
    var songIdsArray = $.map(realArray, function(row, i) {
      return row.id;
    });
    return songIdsArray;
  }
  function createPlaylist(e) {
    var songIdsArray = selectSongsToAdd();
    var name = $('#name').val();
    $.ajax({
      url: '/createPlaylist',
      type: 'POST',
      data: {
        songIds: songIdsArray,
        name: name
      },
      success: (function(response) {
        $('#playlists').prepend(("<li class='list-group-item' id=" + response.playlist._id + ">" + response.playlist.name + "</li>"));
      })
    });
    e.preventDefault();
  }
  function addToPlaylist(song) {
    var songIdsArray = selectSongsToAdd();
    var id = $('#playlistId option:selected').val();
    $.ajax({
      url: '/addToPlaylist',
      type: 'put',
      data: {
        songIds: songIdsArray,
        playlistId: id
      },
      success: (function(response) {
        $('#message').empty().append(("<a href='#'>" + name + " updated</a>"));
        $('#message a').delay(2500).fadeOut(500, (function() {
          $('#message a').remove();
        }));
      })
    });
  }
  function deletePlaylist() {
    var id = $('.list-group-item:visible').attr('id');
    var sure = confirm('are you sure you want to delete this playlist?');
    if (sure) {
      $.ajax({
        url: ("/deletePlaylist/" + id),
        type: 'DELETE',
        data: null,
        success: (function(response) {
          $('#searchResults').empty();
          getplaylistindex();
        })
      });
    }
  }
  function getplaylistindex() {
    $('#songsButton').parent().removeClass('active');
    $('#playlistsButton').parent().addClass('active');
    $('.list-group-item:visible').remove();
    $('#orderTableHead').hide();
    $('.order').hide();
    $.ajax({
      url: '/playlists',
      type: 'POST',
      data: null,
      success: (function(response) {
        $('.songs').hide();
        $('.playlistsShow').hide();
        $('.playlistsIndex').show();
        if (response.playlists.length > 0) {
          $('#playlistId').empty();
          $('#playlistId').append("<option>select songs, playlist</option>");
          response.playlists.forEach((function(playlist) {
            $('#playlists').append(("<li class='list-group-item' id=" + playlist._id + ">" + playlist.name + "</li>"));
            $('#playlistId').append(("<option value=" + playlist._id + ">" + playlist.name + "</option>"));
          }));
        }
      })
    });
  }
  function deleteFromPlaylist(e) {
    var songIdsArray = selectSongsToAdd();
    var playlistId = $('.list-group-item:visible').attr('id');
    $.ajax({
      url: '/deleteFromPlaylist',
      type: 'POST',
      data: {
        songIds: songIdsArray,
        playlistId: playlistId
      },
      success: (function(response) {
        appendPlaylistSongs(response.playlist.songs);
      })
    });
    e.preventDefault();
  }
  function createSong(e) {
    var bpm = $('#newSongBPM').val();
    var key = $('#newSongKey').val();
    var title = $('#newSongName').val();
    var artist = $('#newSongArtist').val();
    var album = $('#newSongAlbum').val();
    var genre = $('#newSongGenre').val();
    $.ajax({
      url: '/createSong',
      type: 'POST',
      data: {
        BPM: bpm,
        Key: key,
        Title: title,
        Artist: artist,
        Album: album,
        genre: genre
      },
      success: (function(response) {
        $('#createSong').modal('hide');
      })
    });
    e.preventDefault();
  }
  function songSearch(e) {
    var searchInput = $('#searchInput').val();
    $.ajax({
      url: '/songSearch',
      type: 'POST',
      data: {Song: searchInput},
      success: (function(response) {
        appendSearchResults(response.songs);
      })
    });
    e.preventDefault();
  }
  function albumSearch(e) {
    var album = $('#searchInput').val();
    $.ajax({
      url: '/albumSearch',
      type: 'POST',
      data: {Album: album},
      success: (function(response) {
        appendSearchResults(response.songs);
      })
    });
    e.preventDefault();
  }
  function artistSearch(e) {
    var searchInput = $('#searchInput').val();
    $.ajax({
      url: '/artistSearch',
      type: 'POST',
      data: {Artist: searchInput},
      success: (function(response) {
        appendSearchResults(response.songs);
      })
    });
    e.preventDefault();
  }
  function genreArray() {
    if ($('li').hasClass('ui-selected')) {
      var array = [];
      $('li.ui-selected').each(function() {
        array.push($(this).text());
      });
      return array;
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
      return null;
    }
  }
  function genreFilter(e) {
    var array = genreArray();
    $.ajax({
      url: '/genreFilter',
      type: 'POST',
      data: {genre: array},
      success: (function(response) {
        appendSearchResults(response.songs);
      })
    });
    e.preventDefault();
  }
  function transpose() {
    var array = genreArray();
    var trans = $(this).parent().val();
    var lowBPM = parseInt($('.noUi-handle-lower > div').text());
    var key = $('#key').val();
    $.ajax({
      url: '/transpose',
      type: 'POST',
      data: {
        trans: trans,
        BPM: lowBPM,
        Key: key,
        genre: genreArray
      },
      success: (function(response) {
        appendSearchResults(response.songs);
      })
    });
  }
  function key(e) {
    var array = genreArray();
    var data = $('#key').val();
    $.ajax({
      url: '/key',
      type: 'POST',
      data: {
        Key: data,
        genre: array
      },
      success: (function(response) {
        appendSearchResults(response.songs);
      })
    });
    e.preventDefault();
  }
  function bpm(e) {
    var array = genreArray();
    var lowBPM = parseInt($('.noUi-handle-lower > div').text());
    var highBPM = parseInt($('.noUi-handle-upper > div').text());
    $.ajax({
      url: '/bpm',
      type: 'POST',
      data: {
        BPM: [lowBPM, highBPM],
        genre: array
      },
      success: (function(response) {
        appendSearchResults(response.songs);
      })
    });
    e.preventDefault();
  }
  function bpmKey(e) {
    var array = genreArray();
    var key = $('#key').val();
    var lowBPM = parseInt($('.noUi-handle-lower > div').text());
    var highBPM = parseInt($('.noUi-handle-upper > div').text());
    $.ajax({
      url: '/bpmKey',
      type: 'POST',
      data: {
        BPM: [lowBPM, highBPM],
        Key: key,
        genre: array
      },
      success: (function(response) {
        appendSearchResults(response.songs);
      })
    });
    e.preventDefault();
  }
  function appendSearchResults(songs) {
    if (songs.length > 0) {
      $('#searchResults').empty();
      $('#orderTableHead').hide();
      songs.forEach((function(song) {
        $('#searchResults').append(("<tr id=" + song._id + "><td>" + song.BPM + "</td><td>" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
        $('#searchResults').bind('mousedown', (function(e) {
          e.metaKey = true;
        })).selectable();
      }));
    } else {
      $('#message').empty();
      $('#message').append('<a href="#">didn\'t find anything</a>');
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
  }
  function appendPlaylistSongs(songs) {
    if (songs.length > 0) {
      $('#searchResults').empty();
      songs.forEach((function(song) {
        $('#searchResults').append(("<tr value=" + song.order + ", class='ui-corner-all' ,id=" + song._id + "><td class='order'>" + song.order + "</td><td value=" + song.BPM + ">" + song.BPM + "</td><td value=" + song.Key + ">" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
        $('#searchResults').bind('mousedown', (function(e) {
          e.metaKey = true;
        })).selectable();
      }));
      $('#searchResults').sortable({handle: '.order'});
      $('#searchResults').selectable({
        filter: 'tr',
        cancel: '.order'
      });
    }
  }
  function displaySlider() {
    $('.slider').noUiSlider({
      start: [88, 102],
      range: {
        'min': 66,
        'max': 193
      },
      format: {
        to: function(value) {
          return parseInt(value);
        },
        from: function(value) {
          return parseInt(value);
        }
      }
    });
    $('.slider').Link('lower').to('-inline-');
    $('.slider').Link('upper').to('-inline-');
  }
})();

//# sourceMappingURL=main.map

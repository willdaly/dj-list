(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    displaySlider();
    $('.genres').bind('mousedown', (function(e) {
      e.metaKey = true;
    })).selectable();
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
  }
  function renamePlaylist() {
    var newName = $('#editPlaylistName').val();
    if (newName.length > 3) {
      var id = $('.list-group-item:visible').attr('id');
      $.ajax({
        url: '/renamePlaylist',
        type: 'put',
        data: {
          newName: newName,
          playlistId: id
        },
        success: (function(response) {
          var id = $('.list-group-item:visible a').text(newName);
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>name blank or too short</a>");
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
  }
  function controlsToggle() {
    $('.container').toggle();
    $('.nav.nav-pills.nav-justified').toggle();
  }
  function showPlaylist() {
    var $__0 = this;
    var playlistId = $(this).parent().attr('id');
    $.ajax({
      url: ("/playlists/" + playlistId),
      type: 'POST',
      data: null,
      success: (function(response) {
        $('.songs').hide();
        $('.playlistsIndex').hide();
        $('ul#playlists.list-group li a').not($__0).parent().remove();
        $('.playlistsShow').show();
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
  function noSongSelected() {
    $('#message').empty().append("<a data-target='#'>no songs selected. click on rows to select.</a>");
    $('#message a').delay(2500).fadeOut(500, (function() {
      $('#message a').remove();
    }));
  }
  function editSongShow() {
    if ($('#searchResults .ui-selected').length > 0) {
      $('#searchResults .ui-selected:gt(0)').removeClass('ui-selected');
      var id = $('#searchResults .ui-selected:nth(0)').attr('id');
      var bpm = $('#searchResults .ui-selected:nth(0) td:nth(0)').text();
      var key = $('#searchResults .ui-selected:nth(0) td:nth(1)').text();
      var title = $('#searchResults .ui-selected:nth(0) td:nth(2)').text();
      var artist = $('#searchResults .ui-selected:nth(0) td:nth(3)').text();
      var album = $('#searchResults .ui-selected:nth(0) td:nth(4)').text();
      var genre = $('#searchResults .ui-selected:nth(0) td:nth(5)').text();
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
  function editSong() {
    var id = $('#songId').val();
    var bpm = $('#editSongBPM').val().length > 0 ? $('#editSongBPM').val() : null;
    var key = $('#editSongKey').val().length > 0 ? $('#editSongKey').val() : null;
    var title = $('#editSongTitle').val().length > 0 ? $('#editSongTitle').val() : null;
    var artist = $('#editSongArtist').val().length > 0 ? $('#editSongArtist').val() : null;
    var album = $('#editSongAlbum').val().length > 0 ? $('#editSongAlbum').val() : null;
    var genre = $('#editSongGenre').val().length > 0 ? $('#editsongGenre').val() : null;
    $.ajax({
      url: '/editSong',
      type: 'put',
      data: {
        Id: id,
        BPM: bpm,
        Key: key,
        Title: title,
        Artist: artist,
        genre: genre
      },
      success: (function(response) {
        $('#editSong').modal('hide');
        $('#message').empty().append(("<a data-target='#'>" + response.song.Song + " updated</a>"));
        $('#message a').delay(2500).fadeOut(500, (function() {
          $('#message a').remove();
        }));
      })
    });
  }
  function selectSongsToAdd() {
    var fakeArray = $('tr.ui-selectee.ui-selected');
    if (fakeArray.length > 0) {
      var realArray = $.makeArray(fakeArray);
      var songIdsArray = $.map(realArray, function(row, i) {
        return row.id;
      });
      return songIdsArray;
    } else {
      noSongSelected();
    }
  }
  function createPlaylist(e) {
    var songIdsArray = selectSongsToAdd();
    var name = $('#name').val();
    if (name.length > 3) {
      $.ajax({
        url: '/createPlaylist',
        type: 'POST',
        data: {
          songIds: songIdsArray,
          name: name
        },
        success: (function(response) {
          $('#playlists').prepend(("<li class='list-group-item clearfix' id=" + response.playlist._id + "><a data-target='#'>" + response.playlist.name + "</a><button class='btn pull-right'>add songs</button></li>"));
        })
      });
    } else {
      $('#message').empty().append("<a data-target='#'> playlist name is blank or too short.</a>");
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
    e.preventDefault();
  }
  function addToPlaylist(song) {
    var songIdsArray = selectSongsToAdd();
    if (songIdsArray) {
      var id = $(this).parent().attr('id');
      $.ajax({
        url: '/addToPlaylist',
        type: 'put',
        data: {
          songIds: songIdsArray,
          playlistId: id
        },
        success: (function(response) {
          $('#message').empty().append(("<a data-targer='#'>" + name + " updated</a>"));
          $('#message a').delay(2500).fadeOut(500, (function() {
            $('#message a').remove();
          }));
        })
      });
    }
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
            $('#playlists').append(("<li class='list-group-item clearfix' id=" + playlist._id + "><a data-target='#'>" + playlist.name + "</a><button class='btn pull-right'>add songs</button></li>"));
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
      $('#message').empty().append("<a data-target='#'>select at least one genre</a>");
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
  function hideAlbumColumn() {
    if ($('.albumTd:empty').length === $('#searchResults  > tr').length) {
      $('.albumTd:empty').hide();
      $('#albumTh').hide();
    }
  }
  function appendSearchResults(songs) {
    if (songs.length > 0) {
      $('#searchResults').empty();
      $('#orderTableHead').hide();
      if ($('#albumTh').not(':visible')) {
        $('#albumTh').show();
      }
      songs.forEach((function(song) {
        $('#searchResults').append(("<tr id=" + song._id + "><td>" + song.BPM + "</td><td>" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td class='albumTd'>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
        $('#searchResults').bind('mousedown', (function(e) {
          e.metaKey = true;
        })).selectable();
      }));
      hideAlbumColumn();
    } else {
      $('#message').empty();
      $('#message').append('<a href="#">didn\'t find anything</a>');
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
  }
  function updateOrder(title, oldOrder, newOrder) {
    var playlistId = $('.list-group-item:visible').attr('id');
    $.ajax({
      url: ("/updateOrder/" + playlistId),
      type: 'POST',
      data: {
        songTitle: title,
        oldOrder: oldOrder,
        newOrder: newOrder
      },
      success: (function(response) {
        appendPlaylistSongs(response.playlist.songs);
      })
    });
  }
  function appendPlaylistSongs(songs) {
    if (songs.length > 0) {
      $('#searchResults').empty();
      if ($('#albumTh').not(':visible')) {
        $('#albumTh').show();
      }
      songs.forEach((function(song) {
        $('#searchResults').append(("<tr value=" + song.order + " class='ui-corner-all', id=" + song._id + "><td class='order'>" + song.order + "</td><td value=" + song.BPM + ">" + song.BPM + "</td><td value=" + song.Key + ">" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td class='albumTd'>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
        $('#searchResults').bind('mousedown', (function(e) {
          e.metaKey = true;
        })).selectable();
      }));
      $('#searchResults').sortable({
        handle: '.order',
        update: function(event, ui) {
          var movedSongId = ui.item.context.id;
          var newOrder = ui.item.context.rowIndex;
          var oldOrder = ui.item.attr('value');
          var title = ui.item.context.children[3].innerText;
          updateOrder(title, oldOrder, newOrder);
        }
      });
      $('#searchResults').selectable({
        filter: 'tr',
        cancel: '.order'
      });
      hideAlbumColumn();
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

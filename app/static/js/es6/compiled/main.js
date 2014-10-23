(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    $('#keyFilter').click(key);
    displaySlider();
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
    $('#showPlaylistControls').on('click', '#deletePlaylist', deletePlaylist);
    $('#deleteSong').click(deleteSong);
    $('#songsButton').click(songsControls);
    $('#playlistsButton').click(getplaylistindex);
    $('#playlists').on('click', 'li', showPlaylist);
  }
  function showPlaylist() {
    var $__0 = this;
    var playlistId = $(this).attr('id');
    $.ajax({
      url: ("/playlists/" + playlistId),
      type: 'POST',
      data: null,
      success: (function(response) {
        $('#playlistsIndexControls').hide();
        $('#searchResults').empty();
        $('ul#playlists.list-group li').not($__0).remove();
        $('#showPlaylistControls').show();
        if (response.songs !== null) {
          response.songs.forEach((function(song) {
            $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td value=" + song.bpm + ">" + song.bpm + "</td><td value=" + song.key + ">" + song.key + "</td><td>" + song.title + "</td><td>" + song.artist + "</td><td>" + song.album + "</td><td>" + song.genre + "</td></tr>"));
          }));
        }
      })
    });
  }
  function songsControls() {
    $('ul#playlists.list-group').empty();
    $('#songsButton').parent().addClass('active');
    $('#playlistsButton').parent().removeClass('active');
    $('#playlistsIndexControls').hide();
    $('#showPlaylistControls').hide();
    $('#songControls').show();
  }
  function createPlaylist(e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function() {
      songsArray.push($(this).val());
    });
    var name = $('#name').val();
    $.ajax({
      url: '/createPlaylist',
      type: 'POST',
      data: {
        songIds: songsArray,
        name: name
      },
      success: (function(response) {
        $('#playlists').prepend(("<li class='list-group-item' id=" + response.playlist._id + ">" + response.playlist.name + "</li>"));
      })
    });
    e.preventDefault();
  }
  function addToPlaylist(e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function() {
      songsArray.push($(this).val());
    });
    var id = $('#playlistId').val();
    $.ajax({
      url: '/addToPlaylist',
      type: 'put',
      data: {
        songs: songsArray,
        playlistId: id
      },
      success: (function(response) {
        $('#message').empty().append(("<a href='#'>" + name + " updated</a>"));
        $('#message a').delay(2500).fadeOut(500, (function() {
          $('#message a').remove();
        }));
        $('#playlistId').prepend(("<option value=" + id + ">" + name + "</option>"));
      })
    });
    e.preventDefault();
  }
  function deletePlaylist() {
    var id = $('.list-group-item:visible').attr('id');
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
  function getplaylistindex() {
    $('#songsButton').parent().removeClass('active');
    $('#playlistsButton').parent().addClass('active');
    $('.list-group-item:visible').remove();
    $.ajax({
      url: '/playlists',
      type: 'POST',
      data: null,
      success: (function(response) {
        $('#showPlaylistControls').hide();
        $('#songControls').hide();
        $('#playlistControls').show();
        $('#playlistsIndexControls').show();
        if (response.playlists.length > 0) {
          response.playlists.forEach((function(playlist) {
            $('#playlists').append(("<li class='list-group-item' id=" + playlist._id + ">" + playlist.name + "</li>"));
          }));
        }
      })
    });
  }
  function deleteSong(e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function() {
      songsArray.push($(this).val());
    });
    var playlistId = $('.list-group-item:visible').attr('id');
    $.ajax({
      url: '/playlist',
      type: 'POST',
      data: {
        songs: songsArray,
        playlistId: playlistId
      },
      success: (function(response) {
        $('#searchResults input:checkbox:checked').closest('tr').remove();
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
    var genreArray = [];
    $('.newSongGenre input:checkbox:checked').each(function() {
      genreArray.push($(this).val());
    });
    $.ajax({
      url: '/createSong',
      type: 'POST',
      data: {
        BPM: bpm,
        Key: key,
        Title: title,
        Artist: artist,
        Album: album,
        genre: genreArray
      },
      success: (function(response) {
        $('#createSong').modal('hide');
      })
    });
    e.preventDefault();
  }
  function genreFilter(e) {
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked) {
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function() {
        genreArray.push($(this).val());
      });
      $.ajax({
        url: '/genreFilter',
        type: 'POST',
        data: {genre: genreArray},
        success: (function(response) {
          $('#searchResults').empty();
          response.songs.forEach((function(song) {
            $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td value=" + song.BPM + ">" + song.BPM + "</td><td value=" + song.Key + ">" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
          }));
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
    e.preventDefault();
  }
  function songSearch(e) {
    var searchInput = $('#searchInput').val();
    $.ajax({
      url: '/songSearch',
      type: 'POST',
      data: {Song: searchInput},
      success: (function(response) {
        if (response.songs.length > 0) {
          $('#searchResults').empty();
          response.songs.forEach((function(song) {
            $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td value=" + song.BPM + ">" + song.BPM + "</td><td value=" + song.Key + ">" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
          }));
        } else {
          $('#message').empty().append(("<a href='#'>can't find " + searchInput + "</a>"));
          $('#message a').delay(2500).fadeOut(500, (function() {
            $('#message a').remove();
          }));
        }
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
        if (response.songs.length > 0) {
          $('#searchResults').empty();
          response.songs.forEach((function(song) {
            $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td value=" + song.BPM + ">" + song.BPM + "</td><td value=" + song.Key + ">" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
          }));
        } else {
          $('#message').empty().append(("<a href='#'>can't find " + album + "</a>"));
          $('#message a').delay(2500).fadeOut(500, (function() {
            $('#message a').remove();
          }));
        }
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
        if (response.songs.length > 0) {
          $('#searchResults').empty();
          response.songs.forEach((function(song) {
            $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td value=" + song.BPM + ">" + song.BPM + "</td><td value=" + song.Key + ">" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
          }));
        } else {
          $('#message').empty().append(("<a href='#'>can't find " + searchInput + "</a>"));
          $('#message a').delay(2500).fadeOut(500, (function() {
            $('#message a').remove();
          }));
        }
      })
    });
    e.preventDefault();
  }
  function transpose() {
    var trans = $(this).parent().val();
    var bpm = $('#lowBPM').val();
    var key = $('#key').val();
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked) {
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function() {
        genreArray.push($(this).val());
      });
      $.ajax({
        url: '/transpose',
        type: 'POST',
        data: {
          trans: trans,
          BPM: bpm,
          Key: key,
          genre: genreArray
        },
        success: (function(response) {
          if (response.songs.length > 0) {
            $('#searchResults').empty();
            response.songs.forEach((function(song) {
              $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td value=" + song.BPM + ">" + song.BPM + "</td><td value=" + song.Key + ">" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
            }));
          } else {
            $('#message').append('<a href="#">didn\'t find anything</a>');
            $('#message a').delay(2500).fadeOut(500, (function() {
              $('#message a').remove();
            }));
          }
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
  }
  function bpmKey(e) {
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked) {
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function() {
        genreArray.push($(this).val());
      });
      var key = $('#key').val();
      var lowBPM = $('#lowBPM').val();
      var highBPM = $('#highBPM').val();
      $.ajax({
        url: '/bpmKey',
        type: 'POST',
        data: {
          BPM: [lowBPM, highBPM],
          Key: key,
          genre: genreArray
        },
        success: (function(response) {
          if (response.songs.length > 0) {
            $('#searchResults').empty();
            response.songs.forEach((function(song) {
              $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td>" + song.BPM + "</td><td>" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
            }));
          } else {
            $('#message').append('<a href="#">didn\'t find anything</a>');
            $('#message a').delay(2500).fadeOut(500, (function() {
              $('#message a').remove();
            }));
          }
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
    e.preventDefault();
  }
  function key(e) {
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked) {
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function() {
        genreArray.push($(this).val());
      });
      var data = $('#key').val();
      $.ajax({
        url: '/key',
        type: 'POST',
        data: {
          Key: data,
          genre: genreArray
        },
        success: (function(response) {
          if (response.songs.length > 0) {
            $('#searchResults').empty();
            response.songs.forEach((function(song) {
              $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td>" + song.BPM + "</td><td>" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
            }));
          } else {
            $('#message').append('<a href="#">didn\'t find anything</a>');
            $('#message a').delay(2500).fadeOut(500, (function() {
              $('#message a').remove();
            }));
          }
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
    e.preventDefault();
  }
  function bpm(e) {
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked) {
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function() {
        genreArray.push($(this).val());
      });
      var lowBPM = $('#lowBPM').val();
      var highBPM = $('#highBPM').val();
      $.ajax({
        url: '/bpm',
        type: 'POST',
        data: {
          BPM: [lowBPM, highBPM],
          genre: genreArray
        },
        success: (function(response) {
          if (response.songs.length > 0) {
            $('#searchResults').empty();
            response.songs.forEach((function(song) {
              $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td>" + song.BPM + "</td><td>" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
            }));
          } else {
            $('#message').append('<a href="#">didn\'t find anything</a>');
            $('#message a').delay(2500).fadeOut(500, (function() {
              $('#message a').remove();
            }));
          }
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500, (function() {
        $('#message a').remove();
      }));
    }
    e.preventDefault();
  }
  function displaySlider() {
    $('.slider').noUiSlider({
      start: [88, 102],
      range: {
        'min': 66,
        'max': 193
      },
      serialization: {
        lower: [$.Link({target: $('#lowBPM')})],
        upper: [$.Link({target: $('#highBPM')})],
        format: {
          mark: ',',
          decimals: 0
        }
      }
    });
  }
})();

//# sourceMappingURL=main.map

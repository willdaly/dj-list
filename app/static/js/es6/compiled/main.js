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
    $('#transposeFilter').click(transpose);
    $('#createNewSong').click(createSong);
    $('#saveSet').click(saveSet);
    $('#addToPlaylist').click(addToPlaylist);
    $('#dp').click(dp);
    $('#deleteSong').click(deleteSong);
  }
  function saveSet(e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function() {
      songsArray.push($(this).val());
    });
    var name = $('#name').val();
    $.ajax({
      url: '/createPlaylist',
      type: 'POST',
      data: {
        songs: songsArray,
        name: name
      },
      success: (function(response) {
        $('#message').append(("<a href='#'>" + name + " saved</a>"));
        $('#message a').delay(2500).fadeOut(500);
      })
    });
    e.preventDefault();
  }
  function addToPlaylist(e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function() {
      songsArray.push($(this).val());
    });
    console.log(songsArray);
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
        $('#message a').delay(2500).fadeOut(500);
        $('#playlistId').prepend(("<option value=" + id + ">" + name + "</option>"));
      })
    });
    e.preventDefault();
  }
  function dp(e) {
    var id = $('#playlistToDelete').val();
    $.ajax({
      url: ("/deletePlaylist/" + id),
      type: 'DELETE',
      data: null,
      success: (function(response) {
        $((".flightCase[value=" + id + "]")).remove();
      })
    });
    e.preventDefault();
  }
  function deleteSong(e) {
    var songsArray = [];
    $('.showTable input:checkbox:checked').each(function() {
      songsArray.push($(this).val());
    });
    var url = window.location.pathname;
    console.log(url);
    var playlistId = url.substring(url.lastIndexOf('/') + 1);
    console.log(playlistId);
    console.log(songsArray);
    $.ajax({
      url: '/playlist',
      type: 'POST',
      data: {
        songs: songsArray,
        playlistId: playlistId
      },
      success: (function(response) {
        $('.showTable input:checkbox:checked').closest('tr').remove();
        $('#showMessages').empty().text('songs removed from playlist');
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
      $('#message a').delay(2500).fadeOut(500);
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
          $('#message a').delay(2500).fadeOut(500);
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
          $('#message a').delay(2500).fadeOut(500);
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
          $('#message a').delay(2500).fadeOut(500);
        }
      })
    });
    e.preventDefault();
  }
  function transpose(e) {
    var trans = $('#transpose').val();
    var bpm = $('#searchResults input:checkbox:checked').first().closest('td').next().text();
    var key = $('#searchResults input:checkbox:checked').first().closest('td').next().next().text();
    var genreChecked = $('.genres input').is(':checked');
    var songChecked = $('#searchResults input').is(':checked');
    if (songChecked) {
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
              $('#message a').delay(2500).fadeOut(500);
            }
          })
        });
      } else {
        $('#message').empty().append("<a href='#'>select at least one genre</a>");
        $('#message a').delay(2500).fadeOut(500);
      }
    } else {
      $('#message').append('<a href="#">must check one song</a>');
      $('#message a').delay(2500).fadeOut(500);
    }
    e.preventDefault();
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
            $('#message a').delay(2500).fadeOut(500);
          }
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500);
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
            $('#message a').delay(2500).fadeOut(500);
          }
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500);
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
            $('#message a').delay(2500).fadeOut(500);
          }
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500);
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

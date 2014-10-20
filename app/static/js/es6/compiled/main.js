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
    $('#plusOne').click(plusOne);
    $('#minusOne').click(minusOne);
    $('#plusTwo').click(plusTwo);
    $('#minusTwo').click(minusTwo);
    $('#plusThree').click(plusThree);
    $('#minusThree').click(minusThree);
    $('#plusFour').click(plusFour);
    $('#minusFour').click(minusFour);
    $('#plusFive').click(plusFive);
    $('#minusFive').click(minusFive);
    $('#createNewSong').click(createSong);
    $('#saveSet').click(saveSet);
    $('#addToPlaylist').click(addToPlaylist);
    $('#dp').click(dp);
    $('#deleteSong').click(deleteSong);
    $('#playlists').click(playlists);
    $('#playlistsTrigger').click(getplaylistindex);
    $('#playlistsIndex').on('click', 'li', showPlaylist);
  }
  function showPlaylist() {
    var id = $(this).attr('id');
    $.ajax({
      url: ("/playlists/" + id),
      type: 'POST',
      data: null,
      success: (function(response) {
        $('#searchResults').empty();
        response.songs.forEach((function(song) {
          $('#searchResults').append(("<tr><td><input type=\"checkbox\", value=" + song._id + "></td><td value=" + song.BPM + ">" + song.BPM + "</td><td value=" + song.Key + ">" + song.Key + "</td><td>" + song.Song + "</td><td>" + song.Artist + "</td><td>" + song.Album + "</td><td>" + song.genre + "</td></tr>"));
        }));
      })
    });
  }
  function playlists() {
    $('.active').removeClass('active');
    $(this).addClass('active');
    $('#songControls').toggle();
    $('#playlistControls').toggle();
  }
  function plusOne() {
    var trans = 1;
    transpose(trans);
  }
  function minusOne() {
    var trans = -1;
    transpose(trans);
  }
  function plusTwo() {
    var trans = 2;
    transpose(trans);
  }
  function minusTwo() {
    var trans = -2;
    transpose(trans);
  }
  function plusThree() {
    var trans = 3;
    transpose(trans);
  }
  function minusThree() {
    var trans = -3;
    transpose(trans);
  }
  function plusFour() {
    var trans = 4;
    transpose(trans);
  }
  function minusFour() {
    var trans = -4;
    transpose(trans);
  }
  function plusFive() {
    var trans = 5;
    transpose(trans);
  }
  function minusFive() {
    var trans = -5;
    transpose(trans);
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
  function getplaylistindex(e) {
    $.ajax({
      url: '/playlists',
      type: 'POST',
      data: null,
      success: (function(response) {
        $('#songControls').toggle();
        $('#playlistControls').toggle();
        response.playlists.forEach((function(playlist) {
          $('#playlistsIndex').append(("<li class='list-group-item' id=" + playlist._id + ">" + playlist.name + "</li>"));
        }));
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
  function transpose(trans) {
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
            $('#message a').delay(2500).fadeOut(500);
          }
        })
      });
    } else {
      $('#message').empty().append("<a href='#'>select at least one genre</a>");
      $('#message a').delay(2500).fadeOut(500);
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

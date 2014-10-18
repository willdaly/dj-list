/* jshint unused:false */

(function(){

  'use strict';

  $(document).ready(init);

  function init(){

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

  } //init

  function createSong(e){
    var bpm = $('#newSongBPM').val();
    var key = $('#newSongKey').val();
    var title = $('#newSongName').val();
    var artist = $('#newSongArtist').val();
    var album = $('#newSongAlbum').val();
    var genreArray = [];
    $('.newSongGenre input:checkbox:checked').each(function(){
      genreArray.push($(this).val());
    });
    $.ajax({
      url: '/createSong',
      type: 'POST',
      data: {BPM: bpm, Key: key, Title: title, Artist: artist, Album: album, genre: genreArray},
      success: response => {
        $('#createSong').modal('hide');
      }
    });
    e.preventDefault();
  }

  function genreFilter(e){
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked){
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function(){
        genreArray.push($(this).val());
      });
      $.ajax({
        url: '/genreFilter',
        type: 'POST',
        data: {genre: genreArray},
        success: response => {
          $('#searchResults').empty();
          response.songs.forEach(song=>{
            $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
          });
        }
      });
    } else {
      $('#genremessage').css('color', 'red');
    }
    e.preventDefault();
  } //genre filter

  function songSearch (e) {
    var searchInput = $('#searchInput').val();
    $.ajax({
      url: '/songSearch',
      type: 'POST',
      data: {Song: searchInput},
      success: response => {
        $('#searchResults').empty();
        if (response.songs.length > 0){
          response.songs.forEach(song=>{
            $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
          });
        } else {
          $('#searchResults').append(`<tr><td></td><td></td><td></td><td>can't find ${searchInput}</td></tr>`);
        }
      }
    });
    e.preventDefault();
  } //songSearch

  function albumSearch (e) {
    var album = $('#searchInput').val();
    $.ajax({
      url: '/albumSearch',
      type: 'POST',
      data: {Album: album},
      success: response => {
        $('#searchResults').empty();
        if (response.songs.length > 0){
          response.songs.forEach(song=>{
            $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
          });
        } else {
          $('#searchResults').append(`<tr><td></td><td></td><td></td><td></td><td></td><td>can't find ${album}</td></tr>`);
        }
      }
    });
    e.preventDefault();
  } //albumSearch

  function artistSearch (e) {
    var searchInput = $('#searchInput').val();
    $.ajax({
      url: '/artistSearch',
      type: 'POST',
      data: {Artist: searchInput},
      success: response => {
        $('#searchResults').empty();
        if (response.songs.length > 0){
          response.songs.forEach(song=>{
            $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
          });
        } else {
          $('#searchResults').append(`<tr><td></td><td></td><td></td><td></td><td>can't find ${searchInput}</td></tr>`);
        }
      }
    });
    e.preventDefault();
  } //artistSearch

  function transpose (e) {
    var trans = $('#transpose').val();
    var bpm = $('#searchResults input:checkbox:checked').first().closest('td').next().text();
    var key = $('#searchResults input:checkbox:checked').first().closest('td').next().next().text();
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked){
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function(){
        genreArray.push($(this).val());
      });
      $.ajax({
        url: '/transpose',
        type: 'POST',
        data: {trans : trans, BPM: bpm, Key: key, genre: genreArray},
        success: response => {
          if (response.songs.length > 0){
            $('#searchResults').empty();
            response.songs.forEach(song=>{
              $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
            });
          } else {
            $('#message').append('<p>didn\'t find anything</p>');
            $('#message p').delay( 1000 ).fadeOut( 500 );
          }
        }
      });
    } else {
      $('#genremessage').css('color', 'red').animate({color: 'black'}, 500);
    }
    e.preventDefault();
  }

  function bpmKey (e) {
    var genreArray = [];
    $('.genres input:checkbox:checked').each(function(){
      genreArray.push($(this).val());
    });
    var key = $('#key').val();
    var lowBPM = $('#lowBPM').val();
    var highBPM = $('#highBPM').val();
    $.ajax({
      url: '/bpmKey',
      type: 'POST',
      data: {BPM:[lowBPM, highBPM], Key: key, genre: genreArray},
      success: response => {
        $('#searchResults').empty();
        response.songs.forEach(song=>{
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  } //bpmkey

  function key(e){
    var genreArray = [];
    $('.genres input:checkbox:checked').each(function(){
      genreArray.push($(this).val());
    });
    var data = $('#key').val();
    $.ajax({
      url: '/key',
      type: 'POST',
      data: {Key:data, genre: genreArray},
      success: response => {
        $('#searchResults').empty();
        response.songs.forEach(song=>{
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  } //key

  function bpm(e){
    var genreArray = [];
    $('.genres input:checkbox:checked').each(function(){
      genreArray.push($(this).val());
    });
    var lowBPM = $('#lowBPM').val();
    var highBPM = $('#highBPM').val();
    $.ajax({
      url: '/bpm',
      type: 'POST',
      data: {BPM:[lowBPM, highBPM], genre: genreArray},
      success: response => {
        $('#searchResults').empty();
        response.songs.forEach(song=>{
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  }

  function displaySlider () {
    $('.slider').noUiSlider({
					start: [ 88, 102 ],
					range: {
						'min': 66,
						'max': 193
					},
          serialization: {
            lower: [
              $.Link({
                target: $('#lowBPM')
              })
            ],
            upper: [
              $.Link({
                target: $('#highBPM'),
              })
            ],
            format: {
              mark: ',',
              decimals: 0
            }
          } //serialization
				}); //noUISlider
  } //displaySlider

})();

/* jshint unused:false */
(function(){

  'use strict';

  $(document).ready(init);

  // var genreArray = [];

  function init(){
    $('#keyFilter').click(key);

    displaySlider();

    $('#bpmFilter').click(bpm);

    $('#bpmKeyFilter').click(bpmKey);

    $('#artistSearch').click(artistSearch);

    $('#albumSearch').click(albumSearch);

    $('#songSearch').click(songSearch);

    $('#genreFilter').click(genreFilter);

  } //init

  function genreFilter(e){
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
          $('#searchResults').append(`<tr><td><input type="checkbox"></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
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
        response.songs.forEach(song=>{
          $('#searchResults').append(`<tr><td><input type="checkbox"></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  }

  function albumSearch (e) {
    var album = $('#searchInput').val();
    $.ajax({
      url: '/albumSearch',
      type: 'POST',
      data: {Album: album},
      success: response => {
        $('#searchResults').empty();
        response.songs.forEach(song=>{
          $('#searchResults').append(`<tr><td><input type="checkbox"></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
        });
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
        response.songs.forEach(song=>{
          $('#searchResults').append(`<tr><td><input type="checkbox"></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  } //artistSearch

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
          $('#searchResults').append(`<tr><td><input type="checkbox"></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
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
          $('#searchResults').append(`<tr><td><input type="checkbox"></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
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
          $('#searchResults').append(`<tr><td><input type="checkbox"></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  }

  function displaySlider () {
    $('.slider').noUiSlider({
					start: [ 87, 112 ],
          // orientation: 'vertical',
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

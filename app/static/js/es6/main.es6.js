/* jshint unused:false */

// var _ = require('lodash');

(function(){

  'use strict';

  $(document).ready(init);

  // var genreArray = [];

  function init(){

    $('#deleteSong').click(deleteSong);

    $('#keyFilter').click(key);

    displaySlider();

    $('#bpmFilter').click(bpm);

    $('#bpmKeyFilter').click(bpmKey);

    $('#artistSearch').click(artistSearch);

    $('#albumSearch').click(albumSearch);

    $('#songSearch').click(songSearch);

    $('#genreFilter').click(genreFilter);

    // $('#transposeFilter').click(transpose);

    $('#saveSet').click(saveSet);

    $('#addToPlaylist').click(addToPlaylist);



  } //init

  function deleteSong (e){
    var songsArray = [];
    $('.showTable input:checkbox:checked').each(function(){
      songsArray.push($(this).val());
    });
    // var id = $('.playlistId').val();
    var url = window.location.pathname;
    console.log(url);
    var playlistId = url.substring(url.lastIndexOf('/') + 1);
    console.log(playlistId);
    // console.log(id);
    console.log(songsArray);
    $.ajax({
      url: '/playlist',
      type: 'POST',
      data: {songs : songsArray, playlistId : playlistId},
      success: response => {
      $('.showTable').empty();
      response.songs.forEach(song=>{
        $('.showTable').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
      });
      $('#showMessages').append('songs removed from playlist');
      }
    });
    e.preventDefault();
  }

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
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
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
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
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
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
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
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  } //artistSearch

  // function transpose (e) {
  //   var transposition = $('#transpose').val() * 1;
  //   var lowRange = transposition * -1;
  //   var highRange = transposition + 1;
  //   var transposeArray = _.range(lowRange, highRange);
  //   var lowBPM = $('#lowBPM').val();
  //   var highBPM = $('#highBPM').val();
  //   var key = $('#key').val();
  //   var majorKeyArray = ['AbM', 'AM', 'BbM', 'BM', 'CM', 'C#M', 'DM', 'EbM', 'EM', 'FM', 'F#M', 'GM'];
  //   var minorKeyArray = ['abm', 'am', 'bbm', 'bm', 'cm', 'c#m', 'dm', 'ebm', 'em', 'fm', 'f#m', 'gm'];
  //   var arrayCheck = $.inArray(key, majorKeyArray);
  //   if (arrayCheck !== -1){
  //
  //   }else{
  //
  //   }
  //   e.preventDefault();
  // }

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
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
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
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
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
          $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.genre}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  }

  function saveSet (e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function(){
      songsArray.push($(this).val());
    });
    var name = $('#name').val();
    $.ajax({
      url: '/createPlaylist',
      type: 'POST',
      data: {songs: songsArray, name: name},
      success: response => {
        $('#message').append(`<p>${name} saved</p>`);
      }
    });
    e.preventDefault();
  }

  function addToPlaylist (e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function(){
      songsArray.push($(this).val());
    });
    console.log(songsArray);
    var id = $('#playlistId').val();
    $.ajax({
      url: '/addToPlaylist',
      type: 'put',
      data: {songs: songsArray, playlistId : id},
      success: response => {
        $('#message').append(`<p>${name} updated</p>`);
      }
    });
    e.preventDefault();
  }

  function displaySlider () {
    $('.slider').noUiSlider({
					start: [ 88, 102 ],
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

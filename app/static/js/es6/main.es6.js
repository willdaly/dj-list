/* jshint unused:false */

(function(){

  'use strict';

  $(document).ready(init);

  function init(){
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
    $('#showPlaylistControls').on('click', '#deletePlaylist', deletePlaylist);
    $('#deleteFromPlaylist').click(deleteFromPlaylist);
    $('#songsButton').click(songsControls);
    $('#playlistsButton').click(getplaylistindex);
    $('#playlists').on('click', 'li', showPlaylist);
    $('.genres').bind('mousedown', e=>{ e.metaKey = true; }).selectable();
    $('#transpose').click(()=>{
      $('.noUi-handle-lower').css('color','red'); //make toggle
      $('.noUi-handle-lower').css('border-color', 'red');
      $('select').css('color','red');
    });

  } //init

  function showPlaylist() {
    var playlistId = $(this).attr('id');
    $.ajax({
      url: `/playlists/${playlistId}`,
      type: 'POST',
      data: null,
      success: response => {
        $('#playlistsIndexControls').hide();
        $('#searchResults').empty();
        $('ul#playlists.list-group li').not(this).remove();
        $('#showPlaylistControls').toggle();
        appendPlaylistSongs(response.songs);
        // $('thead tr:nth-child(4n)').append('<th>order</th>');
      }
    });
  }

  function songsControls() {
    $('ul#playlists.list-group').empty();
    $('#songsButton').parent().addClass('active');
    $('#playlistsButton').parent().removeClass('active');
    $('#playlistsIndexControls').hide();
    $('#showPlaylistControls').hide();
    $('.songs').show();
  }

  function selectSongsToAdd () {
    var fakeArray = $('tr.ui-selectee.ui-selected');
    var realArray = $.makeArray(fakeArray);
    var songIdsArray = $.map(realArray, function(row, i){ return row.id; });
    return songIdsArray;
  }

  function createPlaylist (e) {
    var songIdsArray = selectSongsToAdd();
    var name = $('#name').val();
    $.ajax({
      url: '/createPlaylist',
      type: 'POST',
      data: {songIds: songIdsArray, name: name},
      success: response => {
        $('#playlists').prepend(`<li class='list-group-item' id=${response.playlist._id}>${response.playlist.name}</li>`);
      }
    });
    e.preventDefault();
  }

  function addToPlaylist (song) {
    var songIdsArray = selectSongsToAdd();
    var id = $('#playlistId option:selected').val();
    $.ajax({
      url: '/addToPlaylist',
      type: 'put',
      data: {songIds: songIdsArray, playlistId : id},
      success: response => {
        $('#message').empty().append(`<a href='#'>${name} updated</a>`);
        $('#message a').delay( 2500 ).fadeOut(500, ()=>{$('#message a').remove();} );
      }
    });
  }

  function deletePlaylist () {
    var id = $('.list-group-item:visible').attr('id');
    $.ajax({
      url: `/deletePlaylist/${id}`,
      type: 'DELETE',
      data: null,
      success: response => {
        $('#searchResults').empty();
        getplaylistindex();
      }
    });
  }

  function getplaylistindex (){
    $('#songsButton').parent().removeClass('active');
    $('#playlistsButton').parent().addClass('active');
    $('.list-group-item:visible').remove();
    $.ajax({
      url: '/playlists',
      type: 'POST',
      data: null,
      success: response => {
        $('.songs').hide();
        $('#showPlaylistControls').hide();
        $('#playlistsIndexControls').show();
        if (response.playlists.length > 0){
          $('#playlistId').empty();
          $('#playlistId').append(`<option>select songs, playlist</option>`);
          response.playlists.forEach(playlist=>{
            $('#playlists').append(`<li class='list-group-item' id=${playlist._id}>${playlist.name}</li>`);
            $('#playlistId').append(`<option value=${playlist._id}>${playlist.name}</option>`);
          });
        }
      }
    });
  } //getplaylistindex

  function deleteFromPlaylist (e){
    var songIdsArray = selectSongsToAdd();
    var playlistId = $('.list-group-item:visible').attr('id');
    $.ajax({
      url: '/deleteFromPlaylist',
      type: 'POST',
      data: {songIds : songIdsArray, playlistId : playlistId},
      success: response => {
        appendPlaylistSongs(response.playlist.songs);
      }
    });
    e.preventDefault();
  } //deleteSong


  function createSong(e){
    var bpm = $('#newSongBPM').val();
    var key = $('#newSongKey').val();
    var title = $('#newSongName').val();
    var artist = $('#newSongArtist').val();
    var album = $('#newSongAlbum').val();
    var genre = $('#newSongGenre').val();
    $.ajax({
      url: '/createSong',
      type: 'POST',
      data: {BPM: bpm, Key: key, Title: title, Artist: artist, Album: album, genre: genre},
      success: response => {
        $('#createSong').modal('hide');
      }
    });
    e.preventDefault();
  }

  function songSearch (e) {
    var searchInput = $('#searchInput').val();
    $.ajax({
      url: '/songSearch',
      type: 'POST',
      data: {Song: searchInput},
      success: response => {
        appendSearchResults(response.songs);
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
        appendSearchResults(response.songs);
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
        appendSearchResults(response.songs);
      }
    });
    e.preventDefault();
  } //artistSearch

  function genreArray(){
    if ($('li').hasClass('ui-selected')){
      var array = [];
      $('li.ui-selected').each(function(){
        array.push($(this).text());
      });
      return array;
    } else {
      $('#message').empty().append(`<a href='#'>select at least one genre</a>`);
      $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
      return null;
    }
  }

  function genreFilter(e){
    var array = genreArray();
    $.ajax({
      url: '/genreFilter',
      type: 'POST',
      data: {genre: array},
      success: response => {
        appendSearchResults(response.songs);
      }
    });
    e.preventDefault();
  } //genre filter

  function transpose () {
    var array = genreArray();
    var trans = $(this).parent().val();
    var lowBPM = parseInt($('.noUi-handle-lower > div').text());
    var key = $('#key').val();
    $.ajax({
      url: '/transpose',
      type: 'POST',
      data: {trans : trans, BPM: lowBPM, Key: key, genre: genreArray},
      success: response => {
        appendSearchResults(response.songs);
      }
    });
  }

  function key(e){
    var array = genreArray();
    var data = $('#key').val();
    $.ajax({
      url: '/key',
      type: 'POST',
      data: {Key:data, genre: array},
      success: response => {
        appendSearchResults(response.songs);
      }
    });
    e.preventDefault();
  } //key



  function bpm(e){
    var array = genreArray();
    var lowBPM = parseInt($('.noUi-handle-lower > div').text());
    var highBPM = parseInt($('.noUi-handle-upper > div').text());
    $.ajax({
      url: '/bpm',
      type: 'POST',
      data: {BPM:[lowBPM, highBPM], genre: array},
      success: response => {
        appendSearchResults(response.songs);
      }
    });
    e.preventDefault();
  }

  function bpmKey (e) {
    var array = genreArray();
    var key = $('#key').val();
    var lowBPM = parseInt($('.noUi-handle-lower > div').text());
    var highBPM = parseInt($('.noUi-handle-upper > div').text());
    $.ajax({
      url: '/bpmKey',
      type: 'POST',
      data: {BPM:[lowBPM, highBPM], Key: key, genre: array},
      success: response => {
        appendSearchResults(response.songs);
      }
    });
    e.preventDefault();
  } //bpmkey

  function appendSearchResults(songs){
    if (songs.length > 0){
      $('#searchResults').empty();
      songs.forEach(song=>{
        $('#searchResults').append(`<tr id=${song._id}><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
        $('#searchResults').bind('mousedown', e=>{ e.metaKey = true; }).selectable();
      }); //append songs
    } else {
      $('#message').empty();
      $('#message').append('<a href="#">didn\'t find anything</a>');
      $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
    }
  }

  function appendPlaylistSongs(songs){
    if (songs.length > 0) {
      $('#searchResults').empty();
      songs.forEach(song=>{
        $('#searchResults').append(`<tr value=${song.order}, id=${song._id}><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
        $('#searchResults').bind('mousedown', e=>{ e.metaKey = true; }).selectable();
      });
    }
  }

  function displaySlider () {
    $('.slider').noUiSlider({
					start: [ 88, 102 ],
					range: {
						'min': 66,
						'max': 193
					},

          format: {
            to: function ( value ) {
          		return parseInt(value);
	          },

            from: function ( value ) {
          		return parseInt(value);
        	  }
          }
				}); //noUISlider
    $('.slider').Link('lower').to('-inline-');
    $('.slider').Link('upper').to('-inline-');
  } //displaySlider

})();

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

    $('.transpose').click(transpose);

    $('#createNewSong').click(createSong);

    $('#createPlaylist').click(createPlaylist);

    $('#addToPlaylist').click(addToPlaylist);

    $('#showPlaylistControls').on('click', '#deletePlaylist', deletePlaylist);

    $('#deleteSong').click(deleteSong);

    $('#songsButton').click(songsControls);

    $('#playlistsButton').click(getplaylistindex);

    $('#playlists').on('click', 'li', showPlaylist);

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
        $('#showPlaylistControls').show();
        // $('thead tr:nth-child(4n)').append('<th>order</th>');
        if (response.songs !== null) {
          response.songs.forEach(song=>{
            $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.bpm}>${song.bpm}</td><td value=${song.key}>${song.key}</td><td>${song.title}</td><td>${song.artist}</td><td>${song.album}</td><td>${song.genre}</td></tr>`);
          });
        }
      }
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

  function createPlaylist (e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function(){
      songsArray.push($(this).val());
    });
    var name = $('#name').val();
    $.ajax({
      url: '/createPlaylist',
      type: 'POST',
      data: {songIds: songsArray, name: name},
      success: response => {
        $('#playlists').prepend(`<li class='list-group-item' id=${response.playlist._id}>${response.playlist.name}</li>`);
      }
    });
    e.preventDefault();
  }

  function addToPlaylist (e) {
    var songsArray = [];
    $('#searchResults input:checkbox:checked').each(function(){
      songsArray.push($(this).val());
    });
    var id = $('#playlistId').val();
    $.ajax({
      url: '/addToPlaylist',
      type: 'put',
      data: {songs: songsArray, playlistId : id},
      success: response => {
        $('#message').empty().append(`<a href='#'>${name} updated</a>`);
        $('#message a').delay( 2500 ).fadeOut(500, ()=>{$('#message a').remove();} );
        $('#playlistId').prepend(`<option value=${id}>${name}</option>`);
      }
    });
    e.preventDefault();
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
        $('#showPlaylistControls').hide();
        $('#songControls').hide();
        $('#playlistControls').show();
        $('#playlistsIndexControls').show();
        if (response.playlists.length > 0){
          response.playlists.forEach(playlist=>{
            $('#playlists').append(`<li class='list-group-item' id=${playlist._id}>${playlist.name}</li>`);
          });
        }
      }
    });
  } //deleteSong

  function deleteSong (e){
    var songsIdsArray = [];
    $('#searchResults input:checkbox:checked').each(function(){
      songsIdsArray.push($(this).val());
    });
    var playlistId = $('.list-group-item:visible').attr('id');
    $.ajax({
      url: '/listItem',
      type: 'POST',
      data: {songIds : songsIdsArray, playlistId : playlistId},
      success: response => {
      $('#searchResults input:checkbox:checked').closest('tr').remove();
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
      $('#message').empty().append(`<a href='#'>select at least one genre</a>`);
      $('#message a').delay( 2500 ).fadeOut(500,  ()=>{$('#message a').remove();} );
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
        if (response.songs.length > 0){
          $('#searchResults').empty();
          response.songs.forEach(song=>{
            $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
          });
        } else {
          $('#message').empty().append(`<a href='#'>can't find ${searchInput}</a>`);
          $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
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
        if (response.songs.length > 0){
          $('#searchResults').empty();
          response.songs.forEach(song=>{
            $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
          });
        } else {
          $('#message').empty().append(`<a href='#'>can't find ${album}</a>`);
          $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
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
        if (response.songs.length > 0){
          $('#searchResults').empty();
          response.songs.forEach(song=>{
            $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
          });
        } else {
          $('#message').empty().append(`<a href='#'>can't find ${searchInput}</a>`);
          $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
        }
      }
    });
    e.preventDefault();
  } //artistSearch

  function transpose () {
    var trans = $(this).parent().val();
    var lowBPM = parseInt($('.noUi-handle-lower > div').text());
    var key = $('#key').val();
    var genreChecked = $('.genres input').is(':checked');
      if (genreChecked){
        var genreArray = [];
        $('.genres input:checkbox:checked').each(function(){
          genreArray.push($(this).val());
        });
        $.ajax({
          url: '/transpose',
          type: 'POST',
          data: {trans : trans, BPM: lowBPM, Key: key, genre: genreArray},
          success: response => {
            if (response.songs.length > 0){
              $('#searchResults').empty();
              response.songs.forEach(song=>{
                $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td value=${song.BPM}>${song.BPM}</td><td value=${song.Key}>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
              });
            } else {
              $('#message').append('<a href="#">didn\'t find anything</a>');
              $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
            }
          }
        });
      } else {
        $('#message').empty().append(`<a href='#'>select at least one genre</a>`);
        $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
      }
  }

  function bpmKey (e) {
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked){
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function(){
        genreArray.push($(this).val());
      });
      var key = $('#key').val();
      var lowBPM = parseInt($('.noUi-handle-lower > div').text());
      var highBPM = parseInt($('.noUi-handle-upper > div').text());
      $.ajax({
        url: '/bpmKey',
        type: 'POST',
        data: {BPM:[lowBPM, highBPM], Key: key, genre: genreArray},
        success: response => {
          if (response.songs.length > 0){
            $('#searchResults').empty();
            response.songs.forEach(song=>{
              $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
            });
          } else{
            $('#message').append('<a href="#">didn\'t find anything</a>');
            $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
          }
        }
      });
    } else {
      $('#message').empty().append(`<a href='#'>select at least one genre</a>`);
      $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
    }
    e.preventDefault();
  } //bpmkey

  function key(e){
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked){
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
          if (response.songs.length > 0){
            $('#searchResults').empty();
            response.songs.forEach(song=>{
              $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
            });
          } else {
            $('#message').append('<a href="#">didn\'t find anything</a>');
            $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
          }
        }
      });
    } else {
      $('#message').empty().append(`<a href='#'>select at least one genre</a>`);
      $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
    }
    e.preventDefault();
  } //key

  function bpm(e){
    var genreChecked = $('.genres input').is(':checked');
    if (genreChecked){
      var genreArray = [];
      $('.genres input:checkbox:checked').each(function(){
        genreArray.push($(this).val());
      });
      var lowBPM = parseInt($('.noUi-handle-lower > div').text());
      var highBPM = parseInt($('.noUi-handle-upper > div').text());
      $.ajax({
        url: '/bpm',
        type: 'POST',
        data: {BPM:[lowBPM, highBPM], genre: genreArray},
        success: response => {
          if (response.songs.length > 0){
            $('#searchResults').empty();
            response.songs.forEach(song=>{
              $('#searchResults').append(`<tr><td><input type="checkbox", value=${song._id}></td><td>${song.BPM}</td><td>${song.Key}</td><td>${song.Song}</td><td>${song.Artist}</td><td>${song.Album}</td><td>${song.genre}</td></tr>`);
            });
          } else {
            $('#message').append('<a href="#">didn\'t find anything</a>');
            $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
          }
        }
      });
    } else {
      $('#message').empty().append(`<a href='#'>select at least one genre</a>`);
      $('#message a').delay( 2500 ).fadeOut( 500, ()=>{$('#message a').remove();} );
    }
    e.preventDefault();
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

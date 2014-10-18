/* jshint unused:false */

(function(){

  'use strict';

  $(document).ready(init);

  function init(){

    $('#saveSet').click(saveSet);

    $('#addToPlaylist').click(addToPlaylist);

    $('#deletePlaylist').click(deletePlaylist);

    $('#deleteSong').click(deleteSong);

  } //init

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
        $('#message').empty().append(`<p>${name} updated</p>`);
      }
    });
    e.preventDefault();
  }

  function deletePlaylist (e) {
    var id = $('#playlistToDelete').val();
    $.ajax({
      url: `/deletePlaylist/${id}`,
      type: 'DELETE',
      data: null,
      success: response => {
        $(`.flightCase[value=${id}]`).remove();
      }
    });
    e.preventDefault();
  }

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
      $('.showTable input:checkbox:checked').closest('tr').remove();
      $('#showMessages').empty().text('songs removed from playlist');
      }
    });
    e.preventDefault();
  } //deleteSong

})();

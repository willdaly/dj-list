/* jshint unused:false */
(function(){
  'use strict';
  $(document).ready(init);
  function init(){
    $('#filter').click(key);
  }

  function key(e){
    var data = $('#key').val();
    $.ajax({
      url: '/key',
      type: 'POST',
      data: {Key:data},
      success: response => {
        console.log(response.songs);
        response.songs.forEach(song=>{
          $('#keyBody').append(`<tr><td>${song.Artist}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  } //key

})();

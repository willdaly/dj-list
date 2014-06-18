/* jshint unused:false */
(function(){

  'use strict';

  $(document).ready(init);

  function init(){
    $('#keyFilter').click(key);

    displaySlider();

    $('#bpmFilter').click(bpm);

    $('#bpmKeyFilter').click(bpmKey);
  } //init

  function bpmKey (e) {
    var key = $('#key').val();
    var lowBPM = $('#lowBPM').val();
    var highBPM = $('#highBPM').val();
    $.ajax({
      url: '/bpmKey',
      type: 'POST',
      data: {BPM:[lowBPM, highBPM], Key: key},
      success: response => {
        console.log(response);
        response.songs.forEach(song=>{
          $('#bpmKeyBody').append(`<tr><td></td><td></td><td>${song.Artist}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  } //bpmkey

  function key(e){
    var data = $('#key').val();
    $.ajax({
      url: '/key',
      type: 'POST',
      data: {Key:data},
      success: response => {
        response.songs.forEach(song=>{
          $('#keyBody').append(`<tr><td></td><td></td><td>${song.Artist}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  } //key

  function bpm(e){
    var lowBPM = $('#lowBPM').val();
    var highBPM = $('#highBPM').val();
    $.ajax({
      url: '/bpm',
      type: 'POST',
      data: {BPM:[lowBPM, highBPM]},
      success: response => {
        console.log(response);
        response.songs.forEach(song=>{
          $('#bpmBody').append(`<tr><td></td><td></td><td>${song.Artist}</td><td>${song.Song}</td><td>${song.BPM}</td><td>${song.Key}</td></tr>`);
        });
      }
    });
    e.preventDefault();
  }

  function displaySlider () {
    $('.slider').noUiSlider({
					start: [ 87, 112 ],
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

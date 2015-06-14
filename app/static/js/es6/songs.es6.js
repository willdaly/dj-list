/* global angular */
/* jshint unused:false */
(function(){
  'use strict';
  var app = angular.module('songs', []);
  app.controller('SongController', [ '$http', function($http){
    var songs = this;
    songs.songs = [];
    $http.post('/albumSearch', {Album: 'The Payback'}).success(function(data){
      songs.songs = data;
    });
  }]);
})();

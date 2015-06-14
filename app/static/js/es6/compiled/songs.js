(function() {
  'use strict';
  var app = angular.module('songs', []);
  app.controller('SongController', ['$http', function($http) {
    var songs = this;
    songs.songs = [];
    $http.post('/albumSearch', {body: {Album: 'Another Voyage'}}).success(function(data) {
      songs.songs = data;
    });
  }]);
})();

//# sourceMappingURL=songs.map

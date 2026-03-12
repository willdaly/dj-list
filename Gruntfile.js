'use strict';

module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // ---------------------------------------------------------------------- //
    watch: {
      code: {
        files: ['Gruntfile.js', 'test/**/*.js', 'app/**/*.js', '!app/static/js/vendor/**/*.js'],
        tasks: ['jshint:all']
      }
    },
    // ---------------------------------------------------------------------- //
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'test/**/*.js',
        'app/**/*.js',
        '!app/static/bootstrap/**/*.js',
        '!app/static/js/vendor/**/*.js',
        '!app/static/jquery-ui/*.js',
        '!app/static/jquery-ui/external/jquery/*.js'
      ]
    }
    // ---------------------------------------------------------------------- //
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['jshint:all']);
  grunt.registerTask('default', ['build', 'watch']);
};

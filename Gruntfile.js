/* jshint node: true */
'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    less: {
      options: {
        paths: [
          'node_modules/camunda-commons-ui/resources/less',
          'node_modules/camunda-commons-ui/node_modules/bootstrap/less'
        ]
      },

      styles: {
        files: {
          'styles.css': 'styles.less',
          'dev.css': 'dev.less',
          'normalize.css': 'node_modules/camunda-commons-ui/node_modules/bootstrap/less/normalize.less'
        }
      }
    },

    connect: {
      dev: {
        options: {
          port: 9999,
          livereload: 9998,
          base: '.'
        }
      }
    },

    watch: {
      less: {
        files: ['*.less'],
        tasks: ['less:styles']
      },
      connect: {
        files: [
          '*.*'
        ],
        tasks: [],
        options: {
          livereload: 9998
        }
      }
    }
  });

  grunt.registerTask('default', ['less:styles', 'connect:dev', 'watch']);
};

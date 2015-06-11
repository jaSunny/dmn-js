/* jshint node: true */
'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    less: {
      options: {
        paths: [
          'node_modules/bootstrap/less'
        ]
      },

      styles: {
        files: {
          'dist/styles.css':    'styles/styles.less',
          'dist/dev.css':       'styles/dev.less',
          'dist/normalize.css': 'node_modules/bootstrap/less/normalize.less'
        }
      }
    },

    browserify: {
      scripts: {
        options: {
          browserifyOptions: {
            standalone: 'DecisionTable',
            list: true,
            debug: true
          }
        },
        files: {
          'dist/scripts.js': 'scripts/index.js'
        }
      }
    },

    connect: {
      dev: {
        options: {
          port: 9999,
          livereload: 9998,
          base: 'dist'
        }
      }
    },

    copy: {
      fonts: {
        files: [{expand: true, src: 'fonts/**', dest: 'dist/'}]
      },
      html: {
        files: [
          {src: 'index.html', dest: 'dist/index.html'},
          {src: 'favicon.ico', dest: 'dist/favicon.ico'}
        ]
      }
    },

    watch: {
      less: {
        files: ['*.less'],
        tasks: ['less:styles']
      },

      html: {
        files: ['index.html'],
        tasks: ['copy:html']
      },

      scripts: {
        files: ['scripts/**'],
        tasks: ['browserify:scripts']
      },

      connect: {
        options: {
          livereload: 9998
        },
        files: [
          'dist/**.*'
        ],
        tasks: []
      }
    }
  });

  grunt.registerTask('build', [
    'copy',
    'browserify',
    'less'
  ]);

  grunt.registerTask('default', [
    'build',
    'connect:dev',
    'watch'
  ]);
};

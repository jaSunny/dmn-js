/* jshint node: true */
'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.task.loadTasks('node_modules/styles-editor/tasks');

  grunt.initConfig({
    less: {
      options: {
        paths: [
          'node_modules/bootstrap/less',
          'node_modules'
        ]
      },

      editor: {
        files: {
          'dist/styles-editor.css': 'node_modules/styles-editor/styles/styles-editor.less'
        }
      },

      styles: {
        files: {
          'dist/styles.css':        'styles/styles.less',
          'dist/dev.css':           'styles/dev.less',
          'dist/normalize.css':     'node_modules/bootstrap/less/normalize.less'
        }
      }
    },

    'extract-less-variables': {
      styles: {
        files: {
          'dist/styles-variables.json': 'styles/dmn-variables.less'
        }
      }
    },

    browserify: {
      dependencies: {
        options: {
          browserifyOptions: {
            standalone: 'deps',
            list: true,
            debug: true
          }
        },
        files: {
          'dist/dependencies.js': 'scripts/dependencies.js'
        }
      },

      scripts: {
        options: {
          ignore: [
            './dependencies'
          ],
          exclude: [
            './dependencies'
          ],
          browserifyOptions: {
            standalone: 'DecisionTable',
            list: true,
            debug: true
          }
        },
        files: {
          'dist/scripts.js': 'scripts/index.js'
        }
      },

      editor: {
        options: {
          ignore: [
            './dependencies'
          ],
          exclude: [
            './dependencies'
          ],
          browserifyOptions: {
            standalone: 'StylesEditor',
            list: true,
            debug: true
          }
        },
        files: {
          'dist/styles-editor.js': 'node_modules/styles-editor/scripts/styles-editor.js'
        }
      }
    },

    connect: {
      dev: {
        options: {
          port: 9999,
          livereload: 9998,
          base: [
            'dist',
            'styles',
            'node_modules/grunt-contrib-less/node_modules/less/dist',
            'node_modules/bootstrap/less'
          ]
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
      },
      images: {
        files: [
          {src: 'images/contextmenu-cursor.png', dest: 'dist/contextmenu-cursor.png'}
        ]
      }
    },

    watch: {
      editorScripts: {
        files: [
          'node_modules/styles-editor/scripts/**/*.js'
        ],
        tasks: [
          'browserify:editor'
        ]
      },

      editorStyles: {
        files: [
          'node_modules/styles-editor/styles/**/*.less'
        ],
        tasks: [
          'less:editor'
        ]
      },

      less: {
        files: [
          'styles/**/*.less'
        ],
        tasks: [
          'less:styles'
        ]
      },

      html: {
        files: ['index.html'],
        tasks: ['copy:html']
      },

      scripts: {
        files: [
          'scripts/**/*.js',
          '!scripts/dependencies.js'
        ],
        tasks: [
          'browserify:scripts'
        ]
      },

      dependencies: {
        files: [
          'scripts/dependencies.js'
        ],
        tasks: [
          'browserify:dependencies'
        ]
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

/*
 * js-data
 * http://github.com/jmdobry/js-data
 *
 * Copyright (c) 2014 Jason Dobry <http://jmdobry.github.io/js-data>
 * Licensed under the MIT license. <https://github.com/jmdobry/js-data/blob/master/LICENSE>
 */
module.exports = function (grunt) {
  'use strict';

  require('jit-grunt')(grunt, {
    coveralls: 'grunt-karma-coveralls',
    instrument: 'grunt-istanbul',
    storeCoverage: 'grunt-istanbul',
    makeReport: 'grunt-istanbul'
  });
  require('time-grunt')(grunt);

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    clean: {
      coverage: ['coverage/'],
      dist: ['dist/']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/*.js'],
      jshintrc: '.jshintrc'
    },
    watch: {
      dist: {
        files: ['src/**/*.js'],
        tasks: ['build']
      },
      lite: {
        files: ['src/**/*.js'],
        tasks: ['jshint', 'browserify']
      },
      n: {
        files: ['src/**/*.js', 'test/both/**/*.js', 'test/node/**/*.js'],
        tasks: ['n']
      }
    },
    uglify: {
      main: {
        options: {
          banner: '/**\n' +
          '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
          '* @file js-data.min.js\n' +
          '* @version <%= pkg.version %> - Homepage <http://www.js-data.io/>\n' +
          '* @copyright (c) 2014 Jason Dobry\n' +
          '* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>\n' +
          '*\n' +
          '* @overview Data store.\n' +
          '*/\n'
        },
        files: {
          'dist/js-data.min.js': ['dist/js-data.js']
        }
      }
    },
    browserify: {
      dist: {
        options: {
          browserifyOptions: {
            standalone: 'JSData'
          },
          external: ['js-data-schema', 'bluebird']
        },
        files: {
          'dist/js-data-debug.js': ['src/index.js']
        }
      }
    },
    karma: {
      options: {
        configFile: './karma.conf.js'
      },
      dev: {
        browsers: ['Chrome'],
        autoWatch: true,
        autoWatchBatchDelay: 1000,
        singleRun: false,
        reporters: ['spec'],
        preprocessors: {}
      },
      min: {
        browsers: ['Chrome', 'Firefox', 'PhantomJS'],
        options: {
          files: [
            'dist/js-data.min.js',
            'bower_components/js-data-schema/dist/js-data-schema.min.js',
            'bower_components/js-data-http/dist/js-data-http.min.js',
            'bower_components/js-data-localstorage/dist/js-data-localstorage.min.js',
            'karma.start.js',
            'test/both/**/*.js',
            'test/browser/**/*.js'
          ]
        }
      },
      ci: {
        browsers: ['Chrome', 'Firefox', 'PhantomJS']
      }
    },
    coveralls: {
      options: {
        coverage_dir: 'coverage'
      }
    },
    mochaTest: {
      all: {
        options: {
          reporter: 'spec'
        },
        src: ['mocha.start.js', 'test/both/**/*.js', 'test/node/**/*.js']
      }
    }
  });

  grunt.registerTask('banner', function (filename) {
    var file = grunt.file.read(filename);

    var banner = '/**\n' +
      '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
      '* @file ' + filename + '\n' +
      '* @version ' + pkg.version + ' - Homepage <http://www.js-data.io/>\n' +
      '* @copyright (c) 2014 Jason Dobry \n' +
      '* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>\n' +
      '*\n' +
      '* @overview Data store.\n' +
      '*/\n';

    file = banner + file;

    grunt.file.write(filename, file);
  });

  grunt.registerTask('version', function (filePath) {
    var file = grunt.file.read(filePath);

    file = file.replace(/<%= pkg\.version %>/gi, pkg.version);

    var parts = pkg.version.split('-');
    var numbers = parts[0].split('.');

    file = file.replace(/<%= major %>/gi, numbers[0]);
    file = file.replace(/<%= minor %>/gi, numbers[1]);
    file = file.replace(/<%= patch %>/gi, numbers[2]);

    if (pkg.version.indexOf('alpha') !== -1) {
      file = file.replace(/<%= alpha %>/gi, parts[1].replace('alpha.', '') + (parts.length > 2 ? '-' + parts[2] : ''));
    } else {
      file = file.replace(/<%= alpha %>/gi, false);
    }

    if (pkg.version.indexOf('beta') !== -1) {
      file = file.replace(/<%= beta %>/gi, parts[1].replace('beta.', '') + (parts.length > 2 ? '-' + parts[2] : ''));
    } else {
      file = file.replace(/<%= beta %>/gi, false);
    }

    grunt.file.write(filePath, file);
  });

  grunt.registerTask('debug', function (filePath) {
    var file = grunt.file.read(filePath);

    var lines = file.split('\n');

    var newLines = [];

    lines.forEach(function (line) {
      if (line.indexOf('logFn(') === -1) {
        newLines.push(line);
      }
    });

    file = newLines.join('\n');

    file += '\n';

    grunt.file.write(filePath.replace('-debug', ''), file);
  });

  grunt.registerTask('n', ['mochaTest']);
  grunt.registerTask('b', ['karma:ci', 'karma:min']);
  grunt.registerTask('w', ['n', 'watch:n']);

  grunt.registerTask('test', ['build', 'n', 'b']);
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'browserify',
    'debug:dist/js-data-debug.js',
    'version:dist/js-data-debug.js',
    'version:dist/js-data.js',
    'banner:dist/js-data-debug.js',
    'banner:dist/js-data.js',
    'uglify:main'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('golite', ['jshint', 'browserify', 'watch:lite']);
  grunt.registerTask('default', ['build']);
};

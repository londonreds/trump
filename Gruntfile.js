require('dotenv').config();

const _ = require('lodash'),
  paths = require('./paths'),
  config = require('./app/config'),
  timeGrunt = require('time-grunt');

module.exports = function(grunt) {

  timeGrunt(grunt);

  const pkg = grunt.file.readJSON('package.json'),
    dbConfig = config.db,
    server = grunt.file.readJSON('package.json').main,
    watchFiles = [
      `${paths.appDir}/**/*.js`,
      `${paths.grunt}/**/*.js`,
      `${paths.src.js}/**/*.js`,
      `${paths.src.css}/**/*.scss`,
    ],
    eslintFiles = _.filter(watchFiles, (value) => {
      return /\.js$/.test(value)
    });

  grunt.initConfig({
    pkg,

    server,

    clean: {
      all: {
        src: [`${paths.dist.rootDir}/*`, `${paths.temp.rootDir}/*`]
      }
    },

    copy: {
      css: {
        src: `${paths.temp.css}/index.css`,
        dest: `${paths.dist.css}/index.min.css`,
      },
      js: {
        src: `${paths.temp.js}/trump.js`,
        dest: `${paths.dist.js}/trump.min.js`,
      }
    },

    cssmin: {
      default: {
        files: {
          [`${paths.dist.css}/index.min.css`]: `${paths.temp.css}/index.css`
        }
      }
    },

    eslint: {
      src: eslintFiles
    },

    express: {
      default: {
        options: {
          script: server,
        }
      }
    },

    sass: {
        dist: {
            files: {
                [`${paths.temp.css}/index.css`]: `${paths.src.css}/index.scss`
            }
        }
    },

    shell: {
      dropDb: {
        command: `mongo ${dbConfig.location}/${dbConfig.db} --eval "db.dropDatabase()"`
      },
      seedDb: {
        command: `mongoimport -h ${dbConfig.location} -d ${dbConfig.db} -c ${dbConfig.collection} --file ${dbConfig.seeder} --jsonArray`
      }
    },

    uglify: {
      default: {
        files: {
          [`${paths.dist.js}/trump.min.js`]: `${paths.temp.js}/trump.js`
        }
      }
    },

    watch: {
      files: watchFiles,
      tasks: ['eslint', 'webpack', 'copy:js', 'sass', 'copy:css']
    },

    webpack: {
      default: {
        entry: `${paths.src.js}/index.js`,
        externals: {
          'webpack-runtime-config/fbAppId': process.env.FB_APP_ID,
          'webpack-runtime-config/gaTrackingId': `var '${process.env.GA_TRACKING_ID}'`
        },
        output: {
          path: `${paths.temp.js}`,
          filename: 'trump.js'
        },
        module: {
          loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /(node_modules)/,
            query: { presets: ['es2015'] }
          }]
        }
      }
    }
  });

  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.registerTask('develop', ['eslint', 'clean', 'webpack', 'copy:js', 'sass', 'copy:css', 'express', 'watch']);
  grunt.registerTask('default', 'develop');
  grunt.registerTask('db-seed', 'shell:seedDb');
  grunt.registerTask('db-drop', 'shell:dropDb');
  grunt.registerTask('db-reset', ['db-drop', 'db-seed']);
  grunt.registerTask('build', ['clean', 'webpack', 'uglify', 'sass', 'cssmin']);
};
const gulp = require('gulp');
const { watch, series } = require('gulp');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const server = require('browser-sync').create();
sass.compiler = require('node-sass');

const paths = {
  scripts: {
    src: './',
    dest: './build/'
  }
};

// Reload Server
async function reload() {
  server.reload();
}

// Sass compiler
async function compileSass() {
  return gulp.src('./assets/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('all.css'))
    .pipe(sourcemaps.write())
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('./build/dist/css/'))
    .pipe(server.stream());
}

// Copy assets after build
async function copyAssets() {
  gulp.src(['assets/**/*'])
    .pipe(gulp.dest(paths.scripts.dest));
}

// Build files html and reload server
async function buildAndReload() {
  await includeHTML();
  await compileSass();
  // await copyAssets();
  reload();
}

async function includeHTML() {
  return gulp.src([
    './views/*.html',
    '!header.html', // ignore
    '!footer.html' // ignore
  ])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(paths.scripts.dest));
}
exports.includeHTML = includeHTML;

exports.default = async function () {
  // Init serve files from the build folder
  server.init({
    server: {
      baseDir: paths.scripts.dest
    }
  });
  // Build and reload at the first time
  buildAndReload();
  // Watch Sass task
  watch('./assets/sass/*.scss', series(compileSass));
  // Watch task
  watch(["./views/*.html"], series(buildAndReload));
};
const browsersync = require('browser-sync').create()
const gulp = require('gulp')
const sass = require('gulp-sass')
const minify = require('gulp-minify')
const imagemin = require('gulp-imagemin')
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const del = require('del')

const siteName = 'maiscafeporfavor'
const dir = `../../Local Sites/${siteName}/app/public/wp-content/themes/${siteName}`

const paths = {
  styles: {
    src: 'src/styles/**/*.sass',
    dest: dir,
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: `${dir}/js`,
  },
  images: {
    src: 'src/images/**/*',
    dest: `${dir}/img`,
  },
  php: {
    srcNull: 'src/php/**/*',
    src: 'src/php/**/!(_)*',
    dest: dir,
  },
}

function browserSyncInit(done) {
  browserSync.init(config.plugins.browserSync)
  done()
}
gulp.task('browser-sync', browserSyncInit)

// BrowserSync
function bSync(done) {
  browsersync.init({
    proxy: `${siteName}.local`,
    port: 3000,
    open: true,
    notify: false,
  })
  done()
}

function clean() {
  return del(paths.php.dest, {
    force: true,
  })
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sass())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browsersync.stream())
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: 'style',
        suffix: '.min',
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browsersync.stream())
}

function scripts() {
  return gulp
    .src(paths.scripts.src, { sourcemaps: true })
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(minify())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browsersync.stream())
}

function images() {
  return gulp
    .src(paths.images.src)
    .pipe(
      imagemin([
        imagemin.gifsicle({
          interlaced: true,
        }),
        imagemin.mozjpeg({
          progressive: true,
        }),
        imagemin.optipng({
          optimizationLevel: 5,
        }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browsersync.stream())
}

function php() {
  return gulp
    .src(paths.php.src)
    .pipe(gulp.dest(paths.php.dest))
    .pipe(browsersync.stream())
}

function watch() {
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.images.src, images)
  gulp.watch(paths.php.src, php)
  gulp.watch(paths.php.srcNull, php)
}

var build = gulp.series(
  clean,
  gulp.parallel(bSync, watch, styles, scripts, images, php)
)

exports.clean = clean
exports.styles = styles
exports.scripts = scripts
exports.images = images
exports.php = php
exports.watch = watch
exports.build = build

exports.default = gulp.parallel(build)

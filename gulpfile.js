var gulp         = require('gulp');
var sass         = require('gulp-sass');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var runSequence  = require('run-sequence');
var browserSync  = require('browser-sync');
var nodemon      = require('gulp-nodemon');

gulp.task('js', function(){
  return gulp.src([
    './bower_components/angular/angular.js',
    './bower_components/angular-route/angular-route.js',
    './bower_components/angular-translate/angular-translate.js',
    './bower_components/angular-cookies/angular-cookies.js',
    './bower_components/angular-sanitize/angular-sanitize.js',
    './bower_components/socket.io-client/socket.io.js',
    './bower_components/angular-socket-io/socket.js',
    './bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',

    './src/js/app.js'])
    .pipe(concat('app.min.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('./public/js'))
});

gulp.task('nodemon', function (cb) {

	var started = false;

	return nodemon({
		script: 'server.js'
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true;
		}
	});
});

gulp.task('serve',['nodemon'], function() {
  browserSync({
		proxy: "http://localhost:8080",
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000
      });
});

gulp.task('scripts', function(){
	return gulp.src(['./src/scripts/*.js'])
			//.pipe(uglify())
			//.pipe(concat('vendor.min.js'))
			.pipe(gulp.dest('./public/js'));
});

gulp.task('sass', function () {
  return gulp.src(['./src/sass/ltr-app.scss', './src/sass/rtl-app.scss','./src/css/*.css'])
  .pipe(sass())
  .pipe(gulp.dest('./public/css'));
});

gulp.task('views', function () {
  return gulp.src(['./src/**/*.html'])
  //.pipe(sass())
  .pipe(gulp.dest('./public'));
});

gulp.task('translations', function () {
  return gulp.src(['./src/translations/*.json'])
  //.pipe(sass())
  .pipe(gulp.dest('./public/translations'));
});


gulp.task('fonts', function () {
  return gulp.src(['./src/fonts/*.*'])
  //.pipe(sass())
  .pipe(gulp.dest('./public/fonts'));
});



gulp.task('build', ['scripts','sass','views','translations','fonts'], function() {
  runSequence('js');
});

gulp.task('default', ['build'], function() {});

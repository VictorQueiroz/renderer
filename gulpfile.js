var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var wrapper = require('gulp-wrapper');

gulp.task('build', function() {
	gulp.src([
		'src/helpers.js',
		'src/renderer.js',
		'src/EventEmitter.js',
		'src/Watcher.js',
		'src/Scope.js',
		'src/Compile.js',
		'src/Scanner.js',
		'src/**/*.js'
	])
	.pipe(concat('renderer.js'))
	.pipe(wrapper({
		header: '(function(global) { "use strict"; ',
		footer: '}(window));'
	}))
  .pipe(uglify({
    mangle: false,
    output: {
      beautify: 1
    }
  }))
  .pipe(gulp.dest('build'))
  .pipe(concat('renderer.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('build'));
});

gulp.task('jshint', function() {
  gulp.src(['src/**/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

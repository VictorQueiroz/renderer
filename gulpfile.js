var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
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
	.pipe(uglify())
	.pipe(gulp.dest('build'));
});

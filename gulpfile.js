var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var wrapper = require('gulp-wrapper');

gulp.task('build', function() {
	gulp.src([
		'src/helpers.js',
    'src/renderer.js',
    'src/Scanner.js',
    'src/**/*.js',
	])
	.pipe(concat('renderer.js'))
	.pipe(wrapper({
		header: '(function() { "use strict"; ',
		footer: '}());'
	}))
	.pipe(gulp.dest('build'));
});
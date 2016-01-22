var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var wrapper = require('gulp-wrapper');

const SCRIPTS = [
  'src/helpers.js',
  'src/EventEmitter.js',
  'src/Observer.js',
  'src/Watcher.js',
  'src/Scope.js',
  'src/AST.js',
  'src/Lexer.js',
  'src/Grammar.js',
  'src/ASTCompiler.js',
  'src/ASTFinder.js',
  'src/interpolate.js',
  'src/Attributes.js',
  'src/compile.js',
  'src/renderer.js',
  'src/Scanner.js',
  'src/**/*.js',
];

gulp.task('build', function() {
	gulp.src(SCRIPTS).pipe(concat('renderer.js'))
	.pipe(wrapper({
		header: '(function(global) { "use strict"; ',
		footer: 'global.renderer = renderer; }(window));'
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

var os = require('os');
var path = require('path');
var gulp = require('gulp');
var to5 = require('gulp-6to5');
var es = require('event-stream');
var nodemon = require('nodemon');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var header = require('gulp-header');
var sourcemaps = require('gulp-sourcemaps');
var cache = require('gulp-cached');
var ignore = require('gulp-ignore');
var zip = require ("gulp-zip");
var headerfooter = require('gulp-headerfooter');
var replace = require('gulp-replace');

var paths = {
    src: ['server/**/*.js', 'src/**/*.js', 'tests/**/*.js'],
    build: '.built'
};


// run npm js-csp through 6to5, store in src/lib/csp
gulp.task("regenerate", function(done) {
    return gulp.src('node_modules/js-csp/src/**/*.js')
        .pipe(gulpif(/src\/csp.js/, rename('index.js')))
        .pipe(to5())
        .pipe(gulp.dest('src/lib/csp'));
});



gulp.task ('staticbower', function() {
    return gulp.src('bower_components/**/*')
        .pipe(zip("Bower.resource"))
        .pipe(gulp.dest ('./metadata/staticresources'));
});

gulp.task ('staticapp', function() {
    return gulp.src(['static/css/*', 'static/output/*', 'static/images/*'])
        .pipe(zip("App.resource"))
        .pipe(gulp.dest ('./metadata/staticresources'));
});


// sed  's/\(href\|src\)="\/bower_components\/\([^"]*\)\"/\1=\"{!URLFOR($Resource.Bower, ''bower_components\/\2'')}\"/'
gulp.task ('bootvf', function() {
    return gulp.src(['static/index.html'])
        .pipe(headerfooter.header('<apex:page applyHtmlTag="true" showHeader="true">'))
        .pipe(headerfooter.footer('</apex:page>'))
        .pipe(replace(/<!DOCTYPE html>/g, ''))
        .pipe(replace(/(href|src)="\/bower_components\/([^"]*)\"/g, '$1=\"{!URLFOR($Resource.Bower, \'$2\')}\"'))
        .pipe(replace(/(href|src)="\/output\/([^"]*)\"/g, '$1=\"{!URLFOR($Resource.App, \'$2\')}\"'))
        .pipe(rename("myreact1.page"))
        .pipe(gulp.dest ('./metadata/pages'));
});

gulp.task('makesfdc', gulp.series('staticbower', 'staticapp', 'bootvf'));
// then force import -v
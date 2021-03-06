var gulp = require('gulp');
var browserify = require('browserify');
var tsify = require('tsify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var errorify = require('errorify');
//var tsConfig = require('./tsconfig.json');

var params = {
    project: 'old'
};

function parseParameters() {
    var args = process.argv,
        lastParam = null;

    for (var i=0,arg;arg=args[i];i++) {
        if (arg.indexOf("--") == 0) {
            lastParam = arg.replace("--", "");
        } else if (lastParam !== null) {
            params[lastParam] = arg;
            lastParam = null;
        }
    }
}

parseParameters();

function getProjectPath() {
    return 'src/examples/' + params.project;
}

function getEntryPath() {
    return getProjectPath() + '/App.ts';
}

function getDestinyPath() {
    return 'examples/' + params.project + '/js';
}

function getTSConfigFile() {
    return './src/examples/' + params.project + '/tsconfig.json';
};

var tsConfig = require(getTSConfigFile());

gulp.task("bundle", function() {
    return browserify({
        basedir: '.',
        debug: true,
        entries: [getEntryPath()],
        paths: [getProjectPath()],
        files: tsConfig.include,
        cache: {},
        packageCache: {}
    })
    .plugin(tsify, { project: getTSConfigFile() })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(getDestinyPath()));
});

gulp.task("watch", function() {
    var bundle = browserify({
        basedir: '.',
        debug: true,
        entries: [getEntryPath()],
        paths: [getProjectPath()],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify, { project: getTSConfigFile() })
    .plugin(watchify)
    .plugin(errorify);

    bundle.on('update', function(){
        bundleWatchify(bundle);
    });

    bundle.on("log", function(msg) {
        console.log(msg);
    });

    bundleWatchify(bundle);
});

function bundleWatchify(bundle) {
    console.log("Creating new bundle: " + (new Date()).toISOString());

    bundle.bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest(getDestinyPath()))
}

gulp.task("default", ["bundle"]);
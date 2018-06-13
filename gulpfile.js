var gulp = require('gulp');
var bundle = require('./tasks/bundle');
var daeToJSON = require('./tasks/daeToJSON');

gulp.task("bundle", bundle.build);
gulp.task("watch", bundle.watch);

gulp.task("daeToJSON", daeToJSON.convert);

gulp.task("default", ["bundle"]);
var gulp = require('gulp');
var bundle = require('./tasks/bundle');
var parseDAEModel = require('./tasks/parseDAEModel');
var parseDAEAnimations = require('./tasks/parseDAEAnimations');

gulp.task("bundle", bundle.build);
gulp.task("watch", bundle.watch);

gulp.task("parseDAEModel", parseDAEModel.convert);
gulp.task("parseDAEAnimations", parseDAEAnimations.convert);

gulp.task("default", ["bundle"]);
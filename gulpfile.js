/*
 Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

"use strict";

// Include Gulp & tools we"ll use
var gulp = require('gulp');
var browsersync = require('browser-sync');

var browsersyncConfig = {
  open: "external",
  startPath: "/uqlibrary-courses/demo/index-live.html",
  host: "dev-app.library.uq.edu.au",
  port: 5000,
  server: {
    baseDir: ["../"]
  },
  files: [
    "elements/*.html",
    "elements/*.js"
  ]
};

// Watch files for changes & reload
gulp.task('serve', function (done) {
  console.log("Running server...");
  browsersync(browsersyncConfig);
  done();
});

// Run the server, but comment out the mock data cookies
// Note: For some reason it often requires a manual hard browser refresh
// to switch from normal serving to this mode
gulp.task('live', function (done) {
  console.log('Running demonstration server...');
  browsersyncConfig.rewriteRules = [
    {
      match: /(document\.cookie="UQLMockData)/g,
      replace: "// $1"
    },
    {
      match: /\/\/ (delete_cookie)/g,
      replace: "$1"
    }
  ];
  browsersync(browsersyncConfig);
  done();
});


// Build production files, the default task
gulp.task('default', gulp.series('serve', function (done) {
  done();
}));

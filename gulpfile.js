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
var gulp = require("gulp");
var browsersync = require("browser-sync");

var browsersyncConfig = {
  open: "external",
  startPath: "/uqlibrary-courses/demo",
  host: "dev-app.library.uq.edu.au",
  port: 9999,
  server: {
    baseDir: ["../"]
  },
  files: [
    "elements/*.html",
    "elements/*.js"
  ]
};

// Watch files for changes & reload
gulp.task("serve", [], function () {
  console.log("Running server...");
  browsersync(browsersyncConfig);
});

// Run the server, but comment out the mock data cookies
// Note: For some reason it often requires a manual hard browser refresh
// to switch from normal serving to this mode
gulp.task("live", [], function () {
  console.log("Running demonstration server...");
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
});


// Build production files, the default task
gulp.task("default", ["serve"], function (cb) {
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require("web-component-tester").gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
  require("require-dir")("tasks");
}
catch (err) {
  // Do nothing
}

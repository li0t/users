'use strict';

require('colors');

var path = require('path');

module.exports = function (global) {

  /**
   * Use this to include a script relative to the root folder.
   */
  function include(folder, name) {
    var target = path.normalize(path.join(__dirname, folder, name));

    /* Try to require the module */
    try {
      return require(target);
    } catch (ex) {
      console.error(ex);
      return null;
    }
  }

  /**
   * Include a configuration.
   */
  function config(name) {
    return include('config', name);
  }

  /**
   * Use this method to include Components from anywhere.
   */
  function component(name) {
    return include('components', name);
  }

  /**
   * Prints an error and exists the process.
   */
  function panic() {
    console.log("\n\n  An exception has occurred\n".red.bold);
    console.error.apply(console, arguments);
    console.error("\n  Exiting application...\n".bold);

    /* We don't want the app to keep running if it panics */
    process.exit(1);
  }

  global.__appdir = path.normalize(path.join(__dirname, '..'));
  global.__basedir = __dirname;
  global.component = component;
  global.include = include;
  global.config = config;
  global.panic = panic;

};

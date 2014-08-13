
/**
 * config/express.js
 */
 
'use strict';

var express = require('express');
var config = require('./config');

module.exports = function (app, config, passport) {

  // express app configuration
  app.configure(function () {

    app.set('port', process.env.PORT || config.port);
    app.use(express.static(config.root + '/public'));
    if (config.env === "development") {
      app.use(express.logger('dev'));
    }
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(passport.initialize());
    app.use(app.router);
  });
};
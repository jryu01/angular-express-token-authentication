
/**
 * config/express.js
 */
 
'use strict';

var express = require('express');

module.exports = function (app, config, passport) {

  // express app configuration
  app.configure(function () {

    app.set('port', process.env.PORT || 3000);
    app.use(express.static(config.root + '/public'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(passport.initialize());
    app.use(app.router);
  });
};
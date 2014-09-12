
/**
 * server.js
 */

'use strict';

// set up ==================================================
var http = require('http');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/config'); // config file
var app = express();// express app
var server = http.createServer(app); // server

// configuration ===========================================

// db connection
mongoose.connect(config.mongo.url);

// passport config
require('./config/passport')(passport, config);

// express app config
require('./config/express')(app, config, passport);

// routes ==================================================
require('./app/routes')(app);

// start server ============================================
server.listen(app.get('port'), function () {
  console.log(config.app.name + ' server listening on port ' + 
              app.get('port') + ' for ' + config.env);
});
exports.app = app;

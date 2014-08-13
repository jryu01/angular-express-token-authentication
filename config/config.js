/**
 * configuration file
 *
 */

'use strict';

var path = require('path');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development'; // env variable
var rootPath = path.normalize(__dirname + '/..');

function getConfig (env) {

  var config = {};

  // Common configuration
  config.common =  {
    root: rootPath,
    port: process.env.PORT || 3000,
    mongo: {},
    app: {
      name: "angular-express-token-authentication"
    },
    jwtsecret: 'thisisjwtsecret'
  };

  // Development configuration
  config.development = {
    env: "development",
    mongo: {
      url: "mongodb://localhost/token-auth"
    }
  };

  // Test configuration
  config.test = {
    env: "test",
    port: process.env.PORT || 3030,
    mongo: {
      url: "mongodb://localhost/token-auth-test"
    }
  };

  // Production configuration
  config.production = {
    env: "production",
    mongo: {
      url: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL
    }
  };
  return _.merge(config.common, config[env]);
}

module.exports = getConfig(env);
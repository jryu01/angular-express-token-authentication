/**
 * middleware for securing routes
 *
 */

'use strict';

// generic require signin middleware
exports.requiresAuth = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.send(401, { message: "requires authentication"});
  }
  next();
};

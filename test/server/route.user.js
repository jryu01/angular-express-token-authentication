var mongoose = require('mongoose');
    mongoose.models = {};
    mongoose.modelSchemas = {};
var request = require('supertest');
var expect = require('chai').expect;
var config = require('../../config/config');
var User = require('../../app/models/user');
var app = require('../../server').app;
var _ = require('lodash');

describe('User Routes', function () {

  request = request(app);

  var apiAccessToken = '';
  var curUser = null;

  before('Create a user in the db', function (done) {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(config.mongo.url);
    }
    var user = new User({
      local: {
        email: 'test@test.com',
        password: 'password'
      } 
    }); 
    user.save(function (err) {
      if (err) return done(err);
      curUser = user.toJSON();
      done();
    });
  });
  
  describe('Before running secured route tests', function () {
    it('retrives an access token', function (done) {
      request
        .post('/api/access_token')
        .send({
          grantType:'password',
          email: 'test@test.com',
          password: 'password'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            console.log(res.body);
            return done(err);
          }
          apiAccessToken = res.body.access_token;
          done();
        });
    });
  });

  describe('User', function () {
    describe('GET /api/users', function () {
      it('responds with 401 without an access_token', function (done) {
        request
          .get('/api/users')
          .expect(401, {
            "message": "An access token must be provided"
          }, done);
      });    
      it('responds with 500 with an invalid access_token', function (done) {
        request
          .get('/api/users')
          .query({ "access_token": 'invalidAccessToken' })
          .expect(500, {
            "message": "Invalid Token: Not enough or too many segments" 
          }, done);
      });
      it('responds with 200 with an valid access_token', function (done) {
        request
          .get('/api/users')
          .query({ "access_token": apiAccessToken })
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body).to.have.deep
            .property('[0].local.email', 'test@test.com');
            done();
          });
      });
    });
    describe('GET /api/me', function () {
      it('responds with 401 without an access_token', function (done) {
        request
          .get('/api/me')
          .expect(401, {
            "message": "An access token must be provided"
          }, done);
      });    
      it('responds with 500 with an invalid access_token', function (done) {
        request
          .get('/api/me')
          .query({ "access_token": 'invalidAccessToken' })
          .expect(500, {
            "message": "Invalid Token: Not enough or too many segments" 
          }, done);
      });
      it('responds with 200 and returns current user object', function (done) {
        request
          .get('/api/me')
          .query({ "access_token": apiAccessToken })
          .expect(200, {
            id: '' + curUser.id,
            local: {
              email: 'test@test.com'
            }
          }, done);
      });
    });
  });

  after('Clean up the db', function (done) {
    var finished = _.after(1, function (err) {
      mongoose.connection.close();
      done();
    });
    User.remove({}, function (err) {
      if (err) throw err;
      finished();
    });
  });
});

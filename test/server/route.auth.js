var mongoose = require('mongoose');
    mongoose.models = {};
    mongoose.modelSchemas = {};
var request = require('supertest');
var expect = require('chai').expect;
var config = require('../../config/config');
var User = require('../../app/models/user');
var app = require('../../server').app;
var _ = require('lodash');

describe('Auth Routes', function () {

  request = request(app);

  // facebook test user info
  var FB_USER_ID = '324735164367001';
  var FB_USER_ACCESS_TOKEN = 'CAAG2THAkz8sBAKrhqrBep495rvyuh0aYfMKWkk0bAseXDE2LwlWjNPasirXAZBavt1ysdi6LpcKq1PjlChZC4BpIG4TBx2sJvZCTlOCupTfXk47WnefAPHKL3URE8YET2NjbmjwX4sgYzZAdZAwT8Q5EkMjA394HhIZBdgFjf7ZBWnaVXuIgl8RaVJssg00mbGQaGiCwvGnPgjuZAmR9bUpG';
  var FB_USER_INVALID_TOKEN = 'CAADs7qLJFH4BAGBOPz4pyopZAtTfedvNlZCwVVIvoZAVgfgaGpPQaF2FWZB3u7ZBp4eba5PP773CxzCMJGfMyaRZCqhaNAzrnoVKBJw0t9QBZCBnFSoYvXp7IYX1lneoyDm4c19tdV4q25VEwdFmbsPnto2enwJyhbrlBZCaY5goq1ngHZBMBPvYd34VC2QKnqyA7XVEocLIL8pd7MZCyYBNh2ECZBxm2GPQasZD';
  var apiAccessToken = '';

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
      done();
    });
  });

  describe('POST /api/access_token', function () {
    it('returns 400 with no grantType field', function (done) {
      request
        .post('/api/access_token')
        .expect(400, {
          "message": "Missing grantType field."
        }, done);
    });
    it('returns 400 with invalid grantType field', function (done) {
      request
        .post('/api/access_token')
        .send({
          grantType: 'invalidType',
        })
        .expect(400, {
          "message": "Invalid grant type."
        }, done);
    });
    describe('grantType: facebookToken', function () {
      it('returns 400 with facebookToken field missing', function (done) {
        request
          .post('/api/access_token')
          .send({
            grantType: 'facebookToken',
          })
          .expect(400, {
            "message": "Missing facebookToken field."
          }, done);
      });
      it('returns 500 with invalid facebook token', function (done) {
        request
          .post('/api/access_token')
          .send({
            grantType: 'facebookToken',
            facebookToken: FB_USER_INVALID_TOKEN
          })
          .expect(/FacebookGraphAPIError/)
          .expect(500, done);
      });
      it('issues and retreives an access token', function (done) {
        request
          .post('/api/access_token')
          .send({
            grantType:'facebookToken',
            facebookToken: FB_USER_ACCESS_TOKEN 
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body).to.have.property('access_token')
            .that.is.not.empty;
            expect(res.body).to.have.property('user').that.is.an('object');
            done();
          });
      });
      it('creates an user in the db', function (done) {
        User.findOne({'facebook.id': FB_USER_ID}, function (err, user) {
          if (err) return done(err);
          expect(user).to.be.an.instanceof(User);
          expect(user).to.have.deep
            .property('facebook.id', FB_USER_ID);
          done();
        });
      });
    });
    describe('grantType: password', function () {
      it('returns 400 with email field missing', function (done) {
        request
          .post('/api/access_token')
          .send({
            grantType: 'password',
          })
          .expect(400, {
            "message": "Missing email field."
          }, done);
      });
      it('returns 400 with password field missing', function (done) {
        request
          .post('/api/access_token')
          .send({
            grantType: 'password',
            email: 'sample@email.net'
          })
          .expect(400, {
            "message": "Missing password field."
          }, done);
      });
      it('returns 401 with unknown email provided', function (done) {
        request
          .post('/api/access_token')
          .send({
            grantType: 'password',
            email: 'sample@email.net',
            password: 'password'
          })
          .expect(401, {
            "message": "Unknown email."
          }, done);
      });
      it('returns 401 with invalid password', function (done) {
        request
          .post('/api/access_token')
          .send({
            grantType: 'password',
            email: 'test@test.com',
            password: 'wrongpassword'
          })
          .expect(401, {
            "message": "Invalid password."
          }, done);
      });
      it('issues and retreives an access token', function (done) {
        request
          .post('/api/access_token')
          .send({
            grantType: 'password',
            email: 'test@test.com',
            password: 'password'
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body).to.have.property('access_token')
            .that.is.not.empty;
            expect(res.body).to.have.property('user').that.is.an('object');
            done();
          });
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

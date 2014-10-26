'use strict';

var express = require('express');
var services = require('ffl-services');
var env = require('ffl-utils').environment;
var render = require('ffl-middleware').render;
var userService = services.user.createService();
var leagueService = services.league.createService();
var dispatcher = require('ffl-tasks').dispatcher.create();

var router = module.exports = express.Router();

router.get('/', render('site/index', {title: 'Shall we play a game?'}));

router.get('/login', render('site/login', {title: 'Sign in and get your game on.'}));

router.post('/login', function (req, res) {
  var email = req.param('email');
  var password = req.param('password');
  var rememberMe = req.param('rememberMe');

  userService.findByEmailAndPassword(email, password, function (error, user) {
    if (user) {
      var maxAge = (rememberMe) ? env.SESSION_MAX_AGE : 1000 * 60 * 60;
      res.cookie('id', user.id, { maxAge: maxAge, httpOnly: true, signed: true });

      return res.redirect('/app');
    }

    res.send(400);
  });
})

router.get('/register', render('site/register', {title: 'Create your fantasy league.'}));

router.post('/register', function (req, res) {
  var name = req.param('name');
  var email = req.param('email');
  var password = req.param('password');
  var friends = req.param('friends');

  userService.create(email, password, function (error, user) {
    if (error) {
      return res.sendStatus(400);
    }

    leagueService.create(user.id, name, function (error, league) {
      if (error) {
        return res.sendStatus(500);
      }

      // augment league with user entered email
      league.email = email;

      // todo: make this a first class concept?
      var data = {
        type: 'invitation',
        league: league,
        // todo: sanitize via trim, verify friends, etc.
        invitees: friends.split(',')
      };

      dispatcher.send(data, function () {
        res.redirect('/login');
      });
    });
  });
});

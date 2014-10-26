'use strict';

var path = require('path');
var express = require('express');
var less = require('less-middleware');
var bodyParser = require('body-parser');
var middleware = require('ffl-middleware');
var cookieParser = require('cookie-parser');

var app = module.exports = express();

var secret = process.env.SESSION_SECRET;
var pub = path.join(__dirname, '/public');

// configure views
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

// setup custom middleware
middleware.render.set({
  lang: 'en',
  product: 'Fantasy Film League'
});

// setup middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(secret));
app.use(less(pub));
app.use(express.static(pub));

// setup routes
app.use('/', require('./routes/site'));

/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
 
var mongoose = require('mongoose');
var config = require('./config/environment');


// Connect to database 
mongoose.connect(config.mongo.uri, config.mongo.options);


var app = express();

// view engine setup
app.set('views', config.root + '/server/views');
app.set('view engine', 'jade');
app.set('appPath', config.root + '/client');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join( config.root, 'client')));

//load the routes
require('./routes/index')(app);

var notification =  require('./services/notification')();

module.exports = app;

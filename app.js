/* jshint node: true */
/* global panic, getconf, component */
'use strict';


/**** Register globals *****/
require('./config/globals')(global);


/**** Modules *****/
var debug = require('debug')('app:main');
var path = require('path');
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var session = require('express-session');
var bodyParser = require('body-parser');
var security = require('lusca');
var favicon = require('serve-favicon');
var compression = require('compression');
var logger = require('morgan');
var io = require('socket.io')(http);
var sockets = require('./sockets');


/**** Components ****/
var multiParser = component('multiparse');
var schemas = component('schemas');
var routes = component('routes');
var gridfs = component('gridfs');
var auth = component('auth');
var statics = component('statics');


/**** Configuration ****/
var configs = {
  server: getconf('server'),
  security: getconf('security'),
  database: getconf('database'),
  session: getconf('session')(session),
  routes: getconf('routes'), // Routes must be compiled later
  schemas: getconf('schemas'),
  views: getconf('views')(app),
  errors: getconf('errors'),
  statics: getconf('statics'),
  static: getconf('static'),
  auth: getconf('auth')
};


/**** Setup ****/
app.set('port', process.env.PORT || configs.server.port);
app.set('views', path.join(process.cwd(), configs.views.basedir));
app.set('view engine', configs.views.engine);

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); /* Trust first proxy */
  configs.session.cookie.secure = false; /* Serve secure cookies */ /* SET AS FALSE FOR DEV PURPOSE */
}


/**** Middleware ****/
/* Keep this order:
 *
 * 1.- Logger
 * 1.- Favicon
 * 1.- Static
 * 2.- Cookie Parser
 * 3.- Body Parser
 * 4.- Multipart Parser
 * 5.- Session
 * 6.- Security [...]
 * 7.- Compression
 * 8.- Anything else...
 */

app.use(logger(app.get('env') === 'production' ? 'tiny' : 'dev')); /* Logger */
app.use(favicon(__dirname + '/client/assets/icons/favicon.png')); /* Serve favicon */
app.use(express.static(configs.static.basedir)); /* Serve static content */
app.use(configs.session.cookieParser); /* Cookie parser */
app.use(bodyParser.json()); /* Form json body parser */
app.use(bodyParser.urlencoded({
  extended: false
})); /* Form URL encoded body parser */
app.use(multiParser()); /* Form multipart body parser */
app.use(session(configs.session)); /* Session */
//app.use(security.csrf(configs.security.csrf)); /* CSRF security */
//app.use(security.csp(configs.security.csp)); /* CSP security */
//app.use(security.xframe(configs.security.xframe)); /* XFRAME security */
//app.use(security.p3p(configs.security.p3p)); /* P3P security */
//app.use(security.hsts(configs.security.hsts)); /* HSTS security */
//app.use(security.xssProtection(configs.security.xssProtection)); /* XSS protection security */
app.use(compression()); /* Data compression */


/**** Auth ****/
auth(app, configs.auth);


/**** Routes ****/
schemas(configs.schemas.basedir); /* Register schemas */
routes(app, configs.routes.basedir); /* Compile routes */
configs.errors(app); /* Error handlers */


/**** Initialization *****/
configs.database(function (err) {

  if (err) {
    panic("Couldn't connect to the database");
  } else {
    /* Initialize GridFS component */
    gridfs.init(mongoose.connection.db, mongoose.mongo);

    statics.load(configs.statics, function () {
      http.listen(app.get('port'), function () {
        console.log('Server listening on port \x1b[1m' + app.get('port') + '\x1b[0m');
        sockets(io, configs.session); /* Initialize sockets */
      });
    });
  }


});
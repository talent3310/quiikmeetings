var path = require('path');
var errors = require('../components/errors');

module.exports = function (app) {

  app.use('/api/users', require('./users'));
  app.use('/api/user_availability', require('./userAvailability'));
  app.use('/api/google', require('./google'));
  app.use('/api/event_thread', require('./eventThread'));
  app.use('/auth', require('../auth'));
  app.use('/api/user_review', require('./userReview'));
  app.use('/api/events', require('./events'));
  app.use('/api/participants', require('./participant'));
  app.use('/api/cronofy', require('./cronofy'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|controller|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  //loading index.html for root
  //you can use the index.jade file as default
  app.route('/home')
    .get(function(req, res) {
      res.sendFile(app.get('appPath') + '/home.html');
    });   

  app.route('/*')
    .get(function(req, res) {
      res.sendFile(app.get('appPath') + '/index.html');
    });
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });


// error handlers
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
};

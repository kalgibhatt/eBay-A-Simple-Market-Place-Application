var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

var session = require('express-session');

var mongoDao = require('./utils/mongoDao');

var passport = require('passport');

require('./utils/passport')(passport);

// Nice library on dynamic calls REST application: https://github.com/deitch/booster

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Nice findings about static paths: http://stackoverflow.com/questions/27464168/how-to-include-scripts-located-inside-the-node-modules-folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/css', express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/ngjs', express.static(path.join(__dirname, 'public/angularjs')));

// Using HTTPS for server: http://blog.ayanray.com/2015/06/adding-https-ssl-to-express-4-x-applications/

//Session Configurations
// Random String generator place: http://textmechanic.com/text-tools/randomization-tools/random-string-generator/
app.use(session({
	secret: 'r5XiEloJ0Vfb5R26285fQm5z6FeOrHuYYHk5nUcfuFa6aCvZKU',
	resave: false,
	saveUninitialized: true
}));

app.use(function(req, res, next) {
	mongoDao.connect(next);
});

app.use(passport.initialize());

app.use(function(req, res, next) {
	req.passport = passport;
	next();
});

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	mongoDao.fetch('UserDetails', {
		'username'	:	req.originalUrl.substring(1)
	}, function(resultDoc) {
		if(resultDoc.length === 0) {
			var err = new Error('Not Found');
			err.status = 404;
			next(err);
		} else {
			res.render('userProfile', {  });
		}
	});
});

// Prevents caching for every page
// Nice link that explains prevention of caching: http://stackoverflow.com/questions/6096492/node-js-and-express-session-handling-back-button-problem
app.use(function(req, res, next) {
	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	next();
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
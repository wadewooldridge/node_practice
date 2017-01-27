var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

// Express modules for routing.
var index = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');

// Create basic application object.
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up directory to use to store photos.
app.set('photos', __dirname + '/public/photos');

// Set up to server favicon.ico.
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// Developer-friendly logging.
app.use(logger('dev'));
// Parse body of incoming requests.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(busboy());
// Parse cookies from incoming requests.
app.use(cookieParser());
// Server static files from ./public/
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.get('/photos', photos.list);
app.get('/photo/:id/download', photos.download(app.get('photos')));
app.get('/upload', photos.form);
app.post('/upload', photos.submit(app.get('photos')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

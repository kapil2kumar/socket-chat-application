var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');


//MOngoDB
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
//connect to local mongodb database
var db = mongoose.connect('mongodb://127.0.0.1:27017/hospital_demo',{ useNewUrlParser: true });
//attach lister to connected event
mongoose.connection.once('connected', function(err) {
  if(err){
    throw err;
  } else {
    console.log("Connected to database");
  }  
});
mongoose.set('debug', true);


var routes = require('./routes/index');

var app = express();

var multiparty = require('connect-multiparty'),
multipartyMiddleware = multiparty();
app.use(multipartyMiddleware);

app.all('*', function (req, res, next) {
    // add details of what is allowed in HTTP request headers to the response headers
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Max-Age', '86400');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization');
    // the next() function continues execution and will move onto the requested URL/URI
    next();
});


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

routes.route_apis(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
      if (err.name === 'JsonSchemaValidation') {
        var responseData = {
            status: false,
            msg: 'Validation_Error',
            data: null,
            error: err.validations.body
        };
        res.status(400).json({status:false,message: 'Validation Error, Fields are required'});
      } else {
          res.status(err.status).json({status:false,message: err.message,error: err});
          // res.status(err.status || 500);
          // console.log(err);
          // res.render('error', {
          //     message: err.message,
          //     error: err
          // });
      }
  });
}


var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);

// include socket module from route
routes.socket_module(io); //route/index.js

server.listen(8080, function () {
    console.log("Express server listening on port %d in development mode", 8080);
});

module.exports = app;

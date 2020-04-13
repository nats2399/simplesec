var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var ordersRouter = require('./routes/orders');

var employeeRouter = require('./routes/employee');
var supervisorRouter = require('./routes/supervisor');
var ordersdptRouter = require('./routes/ordersdpt');


var app = express();


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 100 } // 24 hours
}))



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/orders', ordersRouter);

app.use('/employee', employeeRouter);
app.use('/supervisor', supervisorRouter);
app.use('/ordersdpt', ordersdptRouter);

app.use("/public", express.static(__dirname + '/public'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.render('errormsg', { title: 'ATTENTION!' , errormessage: 'There was a problem processing your order. Please try again.' , user: req.session.username});
});

module.exports = app;

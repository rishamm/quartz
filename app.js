var createError = require('http-errors');
const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var hbs = require("express-handlebars")
var dotenv =require('dotenv')
dotenv.config();
var app = express();
const session= require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({helpers:{inc: function(value, option){
  return parseInt(value)+1;
}},extname: 'hbs',defaultLayout: 'layout', layoutsDir:__dirname + '/views/layout', partialDir:__dirname + '/views/partials'}));

const nocache = require("nocache");



app.use(nocache());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({secret:"key", resave:false,saveUninitialized:true, cookie:{maxAge:600000}}));

app.use(session({
  secret: 'Your_Secret_Key',
  resave: true,
  saveUninitialized: true
}))


app.use('/admin', adminRouter);
app.use('/', indexRouter);


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
  res.render('error');
});

module.exports = app;

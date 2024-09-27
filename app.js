const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const dotenv = require('dotenv').config();
const expressLayouts = require('express-ejs-layouts')

const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');
const app = express();

// Set view engine
app.use(expressLayouts)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout','layouts/layout')



// Middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', userRouter);
app.use('/admin',adminRouter);


// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(res.render('error'));
});

// Error handler
// app.use((err, req, res, next) => {
//   // Set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // Render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;

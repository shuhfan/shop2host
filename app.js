const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const dotenv = require('dotenv').config();
const expressLayouts = require('express-ejs-layouts')
let maintenanceMode = false;

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

app.post('/admin/maintenance', (req, res) => {
  const { maintenanceMode: isEnabled } = req.body;
  maintenanceMode = isEnabled; // Update the variable based on the request
  res.status(200).send('Maintenance mode updated');
});

function checkMaintenanceMode(req, res, next) {
  if (maintenanceMode && !req.path.startsWith('/admin')) {
      return res.render('maintenance'); // Render a maintenance page
  }
  next(); // Proceed to the next middleware or route handler
}

// Use this middleware in your app
app.use(checkMaintenanceMode);

// Routes
app.use('/', userRouter);
app.use('/admin',adminRouter);



// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(res.render('error'));
});



module.exports = app;

const express = require('express');
const fs = require('fs');
//const bodyParser = require('body-parser');
const path = require('path');
const createError = require('http-errors');
const logger = require('morgan');

const app = express();

// Database
const db = require('./db/server');
// Test the database connection...
db.sequelize.authenticate()
  // If the connection is up:
  .then(console.log('Database connected...'))
  // If the connection fails:
  .catch(err => console.log(`Error: ${err}`));

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Error and Access Logging
app.use(logger('dev', {
  skip(req, res) { return res.statusCode < 400; },
}));
app.use(logger('combined', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Set static paths to server public resources
app.use('/partials', express.static(path.join(__dirname, '/views/partials/')));
app.use(express.static(path.join(__dirname, '/public')));

// Page Routes
const indexRouter = require('./routes/index');
const aboutRouter = require('./routes/about');
const rootnotesRouter = require('./routes/rootnotes');
const scalesRouter = require('./routes/scales');
app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/rootnotes', rootnotesRouter);
app.use('/scales', scalesRouter);
// API Routes
const pg_rootnotesAPI = require('./controllers/api_rootnotes');
const pg_scalesAPI = require('./controllers/api_scales');
app.use('/api/rootnotes', pg_rootnotesAPI);
app.use('/api/scales', pg_scalesAPI);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

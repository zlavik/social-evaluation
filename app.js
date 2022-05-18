const express = require('express');
const path = require('path');
const flash = require('express-flash');
const store = require('connect-loki');
const session = require('express-session');
const redirectFlash = require('@u4da3/express-redirect-flash');
const PgPersistence = require('./lib/database/pg-persistance');
const addUserRouter = require('./routes/addUser');
const indexRouter = require('./routes/index');
const config = require('./lib/config');

const app = express();
const host = 'localhost';
const port = '3000';
const LokiStore = store(session);

// create a new datastore
app.use((req, res, next) => {
  res.locals.store = new PgPersistence(req.session);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in millseconds
    path: '/',
    secure: false,
  },
  name: 'Social Eval',
  resave: false,
  saveUninitialized: true,
  secret: config.SECRET,
  store: new LokiStore({}),
}));

app.use(redirectFlash());
app.use(flash());

// Extract session info
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', indexRouter);
app.use('/addUser', addUserRouter);

// Listener
app.listen(port, host, () => {
  console.log(`Contact App is listening on port ${port} of ${host}!`);
});

module.exports = app;

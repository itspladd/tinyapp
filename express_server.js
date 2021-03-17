const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const helper = require('./helpers');
const app = express();

const PORT = 8080;
const TEMPLATEVARS = require('./constants').TEMPLATEVARS;

// 'Databases'
const urlDatabase = {
  'abcdef': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userID1',
  },
  'ghijkl': {
    longURL: 'http://www.google.com',
    userID: 'userID2',
  }
};

const users = {
  userID1: {
    id: 'userID1',
    username: 'user1',
    email: 'user1@example.com',
    password: 'password1',
  },
  userID2: {
    id: 'userID2',
    username: 'user2',
    email: 'user2@example.com',
    password: 'password2',
  }
}

const errorHandler = {
  errorMessageFlag: false,
  removeErrorsFlag: false,

  addError(page, message, callback) {
    TEMPLATEVARS[page]['error'] = message;
    this.setErrorFlag(true);
    this.setRemovalFlag(false);
    callback();
  },

  wipeErrors() {
    helper.removeFromAny(TEMPLATEVARS, 'error');
    this.setRemovalFlag(false);
    this.setErrorFlag(false);
  },

  setErrorFlag(value) {
    this.errorMessageFlag = value;
  },

  setRemovalFlag(value) {
    this.removeErrorsFlag = value;
  }
};

// Our view engine is EJS
app.set('view engine', 'ejs');

// Body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Custom middleware -
// if we don't have a user set in templatevars,
// and there's an ID cookie, AND we have that user in database,
// set the user object in templatevars.
app.use( (req, res, next) => {
  const userCookie = req.cookies['user_id'];
  if (!TEMPLATEVARS.home['user'] && userCookie && users[userCookie]) {
    const id = req.cookies['user_id'];
    helper.addToAll(TEMPLATEVARS, 'user', users[id]);
  } else if (!users[userCookie]) {
    // If the current cookie's ID doesn't exist in our database, clear it.
    res.clearCookie('user_id');
  }
  next();
});
app.use( (req, res, next) => {
  // If the error removal flag is set, remove error messages from templatevars.
  if (errorHandler.removeErrorsFlag) {
    errorHandler.wipeErrors();
  }

  // If we have an error message flag raised, then lower it and set the "remove" flag.
  // Next time we load a page, we'll remove the error so we don't see it again.
  if (errorHandler.errorMessageFlag) {
    errorHandler.setRemovalFlag(true);
  }

  next();
});




/***********************************/
/** ROUTING ************************/
/***********************************/

/**************************/
/** NON-RENDERING *********/
/**************************/
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/users.json', (req, res) => {
  res.json(users);
});

app.get('/templateVars.json', (req, res) => {
  res.json(TEMPLATEVARS);
});

/**************************/
/** RENDERING *************/
/**************************/
app.get('/', (req, res) => {
  res.render('pages/index', TEMPLATEVARS.home);
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies['user_id']) {
    errorHandler.addError('login', 'You have to log in first!',
    () => res.redirect('/login'));
  } else {
    res.render('pages/urls_new', TEMPLATEVARS.urls_new);
  }
});

app.get('/about', (req, res) => {
  res.render('pages/about', TEMPLATEVARS.about);
});

app.get('/login', (req, res) => {
  res.render('pages/login', TEMPLATEVARS.login);
});

app.get('/register', (req, res) => {
  res.render('pages/register', TEMPLATEVARS.register);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  // If the retrieved longURL is undefined, go to the "url not found" page.
  if (!longURL) {
    TEMPLATEVARS.bad_url['shortURL'] = shortURL;
    res.render('pages/bad_url', TEMPLATEVARS.bad_url);
  } else {
    res.redirect(longURL);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  // Get the short URL and long URL for this page
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  //Set both values in the templatevars for this page
  TEMPLATEVARS.urls_show['shortURL'] = shortURL;
  TEMPLATEVARS.urls_show['longURL'] = longURL;

  res.render('pages/urls_show', TEMPLATEVARS.urls_show);
});

app.get('/urls', (req, res) => {
  TEMPLATEVARS.urls_index['urls'] = urlDatabase;
  res.render('pages/urls_index', TEMPLATEVARS.urls_index);
});

/**************************/
/** POST ******************/
/**************************/

/**
 * Creates a new shortURL for a given longURL
 */
app.post('/urls', (req, res) => {
  const shortURL = helper.randomString();
  const longURL = req.body.longURL;
  const userID = req.cookies['user_id'];
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

/**
 * Updates an existing shortURL with a new longURL
 */
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const id = helper.lookupUserByName(users, req.body.username);
  if (!id) {
    console.log('bad id');
    res.status(403).send('User not found!');
  } else if (users[id].password !== req.body.password) {
    console.log('bad pw');
    res.status(403).send('Incorrect login information.');
  } else {
    console.log('all good')
    res.cookie('user_id', id);
    // Add username to all templatevars
    helper.addToAll(TEMPLATEVARS, 'user', users[id]);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  helper.addToAll(TEMPLATEVARS, 'user', '');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  // Set input vars
  const user_id = helper.randomString(10);
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  if (email === "" || username === "" || password === "") {
    res.status(400).send('No blank fields!');
  } else if (helper.emailExists(users, email)) {
    res.status(400).send('Sorry, that email is taken!');
  } else {
    // Add new user object
    users[user_id] = {
      user_id,
      email,
      username,
      password,
    };

    //Set templatevars
    helper.addToAll(TEMPLATEVARS, 'user', users[user_id]);

    // Create cookie for this login
    res.cookie('user_id', user_id);

    // Redirect to /urls
    res.redirect('/urls');
  }
});


/***********************************/
/** END OF ROUTING *****************/
/***********************************/

app.listen(PORT, () => {
  console.log(`BabyURL listening on port ${PORT}`);
});

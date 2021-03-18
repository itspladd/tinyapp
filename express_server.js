const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const helper = require('./helpers');
const app = express();

const PORT = require('./constants').PORT;
const TEMPLATEVARS = require('./constants').TEMPLATEVARS;

// 'Databases'
const urlDatabase = {
  'abcdef': {
    shortURL: 'abcdef',
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userID1',
  },
  'ghijkl': {
    shortURL: 'abcdef',
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
};

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
app.use((req, res, next) => {
  const userCookie = req.cookies['userID'];
  if (!TEMPLATEVARS.home['user'] && userCookie && users[userCookie]) {
    const id = req.cookies['userID'];
    helper.addToAll(TEMPLATEVARS, 'user', users[id]);
  } else if (!users[userCookie]) {
    // If the current cookie's ID doesn't exist in our database, clear it.
    res.clearCookie('userID');
  }
  next();
});

// Custom middleware: run the errorHandler
app.use((req, res, next) => {
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
    errorHandler.addError('bad_url',
      `URL ${shortURL} not found!`,
      () => res.redirect('/urls/not_found')
    );
  } else {
    res.redirect(longURL);
  }
});

app.get('/urls', (req, res) => {
  const id = req.cookies['userID'];
  if (!id) {
    errorHandler.addError('login',
      'Login to see your BabyURLs, or register an account to start creating them!',
      () => res.redirect('/login')
    );
  } else {
    TEMPLATEVARS.urls_index['urls'] = helper.urlsForUser(id, urlDatabase);
    res.render('pages/urls_index', TEMPLATEVARS.urls_index);
  }
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies['userID']) {
    errorHandler.addError('login', 'You have to log in to create a URL!',
      () => res.redirect('/login'));
  } else {
    res.render('pages/urls_new', TEMPLATEVARS.urls_new);
  }
});

app.get('/urls/not_found', (req, res) => {
  res.render('pages/bad_url', TEMPLATEVARS.bad_url);
});

app.get('/urls/:shortURL', (req, res) => {
  // Get the short URL and long URL for this page
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  const id = req.cookies['userID'];
  if (!id) {
    errorHandler.addError('login',
      'Login to see your URLs, or register an account to start creating them!',
      () => res.redirect('/login')
    );
  } else if (urlDatabase[shortURL].userID !== id) {
    errorHandler.addError('urls_index',
      'You can only view URLs that belong to you!',
      () => res.redirect('/urls')
    );
  }

  //Set both values in the templatevars for this page
  TEMPLATEVARS.urls_show['shortURL'] = shortURL;
  TEMPLATEVARS.urls_show['longURL'] = longURL;

  res.render('pages/urls_show', TEMPLATEVARS.urls_show);
});

/**************************/
/** POST ******************/
/**************************/

/**
 * Creates a new shortURL for a given longURL
 */
app.post('/urls', (req, res) => {
  const userID = req.cookies['userID'];
  if (!userID) {
    errorHandler.addError('login',
      'You have to log in to create a URL!',
      () => res.redirect('/login')
    );
  } else {
    const shortURL = helper.randomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { shortURL, longURL, userID };
    res.redirect(`/urls/${shortURL}`);
  }
});

/**
 * Updates an existing shortURL with a new longURL
 */
app.post('/urls/:shortURL/update', (req, res) => {
  const userID = req.cookies['userID'];
  const shortURL = req.params.shortURL;
  if (!userID) {
    errorHandler.addError('login',
      `You have to log in to update a URL!`,
      () => res.redirect('/login')
    );
  } else if (!urlDatabase[shortURL]) {
    // If the URL doesn't exist
    errorHandler.addError('bad_url',
      `URL ${shortURL} not found!`,
      () => res.redirect('/login')
    );
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userID) {
    // If the URL exists, but doesn't belong to this user
    errorHandler.addError('login',
      `You can't change other users' URLs!`,
      () => res.redirect('/login')
    );
  } else {
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
  }

});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies['userID'];
  const shortURL = req.params.shortURL;
  if (!userID) {
    errorHandler.addError('login',
      `You have to log in to delete a URL!`,
      () => res.redirect('/login')
    );
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userID) {
    // If the URL exists, but doesn't belong to this user
    errorHandler.addError('login',
      `You can't delete other users' URLs!`,
      () => res.redirect('/login')
    );
  } else {

    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const id = helper.lookupUserByName(users, req.body.username);
  if (!id) {
    res.status(403).send('User not found!');
  } else if (users[id].password !== req.body.password) {
    res.status(403).send('Incorrect login information.');
  } else {
    res.cookie('userID', id);
    // Add username to all templatevars
    helper.addToAll(TEMPLATEVARS, 'user', users[id]);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  helper.addToAll(TEMPLATEVARS, 'user', '');
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  // Set input vars
  const userID = helper.randomString(10);
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  if (email === "" || username === "" || password === "") {
    res.status(400).send('No blank fields!');
  } else if (helper.emailExists(users, email)) {
    res.status(400).send('Sorry, that email is taken!');
  } else {
    // Add new user object
    users[userID] = {
      userID,
      email,
      username,
      password,
    };

    //Set templatevars
    helper.addToAll(TEMPLATEVARS, 'user', users[userID]);

    // Create cookie for this login
    res.cookie('userID', userID);

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

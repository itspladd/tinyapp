const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const MessageHandler = require('./MessageHandler.js');
const helper = require('./helpers');
const app = express();

const PORT = require('./constants').PORT;
const TEMPLATEVARS = require('./constants').TEMPLATEVARS;
const messageHandler = new MessageHandler({TEMPLATEVARS, helper});

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

// Our view engine is EJS
app.set('view engine', 'ejs');

// Body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: '1by1sAgr3ml1n',
}));

// Custom middleware -
// if we don't have a user set in templatevars,
// and there's an ID cookie, AND we have that user in database,
// set the user object in templatevars.
app.use((req, res, next) => {
  const userID = req.session.userID;
  if (!TEMPLATEVARS.home['user'] && userID && users[userID]) {
    const id = req.session.userID;
    helper.addToAll(TEMPLATEVARS, 'user', users[id]);
  } else if (!users[userID]) {
    // If the current cookie's ID doesn't exist in our database, clear it.
    req.session.userID = null;
  }
  next();
});

// Custom middleware: run the messageHandler to check for message flags
app.use((req, res, next) => {
  messageHandler.checkFlags();
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
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  res.redirect('/login');
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
  // If the retrieved longURL is undefined, go to the "url not found" page.
  if (!urlDatabase[shortURL]) {
    messageHandler.addBadURLError(shortURL);
    res.render('pages/bad_url', TEMPLATEVARS.bad_url);
    return;
  }
  res.redirect(urlDatabase[shortURL].longURL);
});

app.get('/urls', (req, res) => {
  const id = req.session.userID;
  if (!id) {
    messageHandler.addGenericLoginError('see your URLs');
    res.status(401).render('pages/login', TEMPLATEVARS.login);
    return;
  }

  TEMPLATEVARS.urls_index['urls'] = helper.urlsForUser(id, urlDatabase);
  res.render('pages/urls_index', TEMPLATEVARS.urls_index);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.userID) {
    messageHandler.addGenericLoginError('create new URLs');
    res.status(401).render('pages/login', TEMPLATEVARS.login);
    return;
  }
  
  res.render('pages/urls_new', TEMPLATEVARS.urls_new);
});

app.get('/urls/not_found', (req, res) => {
  res.render('pages/bad_url', TEMPLATEVARS.bad_url);
});

app.get('/urls/:shortURL', (req, res) => {
  // If the URL doesn't exist, redirect the user.
  if (!urlDatabase[req.params.shortURL]) {
    messageHandler.addBadURLError(req.params.shortURL);
    res.render('pages/bad_url', TEMPLATEVARS.bad_url);
    return;
  }
  
  // Get the short URL and long URL for this page
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const id = req.session.userID;

  if (!id) {
    messageHandler.addGenericLoginError('view a URL');
    res.status(401).render('pages/login', TEMPLATEVARS.login);
    return;
  }
  if (urlDatabase[shortURL].userID !== id) {
    messageHandler.addGenericPermissionsError('view');
    res.status(401).render('pages/urls_index', TEMPLATEVARS.urls_index);
    return;
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
  const userID = req.session.userID;
  if (!userID) {
    messageHandler.addGenericLoginError('create a URL');
    res.status(401).render('/login', TEMPLATEVARS.login);
    return;
  }

  const shortURL = helper.randomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { shortURL, longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

/**
 * Updates an existing shortURL with a new longURL
 */
app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  if (!userID) {
    messageHandler.addGenericLoginError('update a url');
    res.status(401).render('pages/login', TEMPLATEVARS.login);
    return;
  }
  if (!urlDatabase[shortURL]) {
    messageHandler.addBadURLError(shortURL);
    res.render('pages/bad_url', TEMPLATEVARS.bad_url);
    return;
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userID) {
    // If the URL exists, but doesn't belong to this user
    messageHandler.addGenericPermissionsError('edit');
    res.status(401).render('pages/urls_index', TEMPLATEVARS.urls_index);
    return;
  }

  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  if (!userID) {
    messageHandler.addGenericLoginError('delete a URL');
    res.status(401).render('pages/login', TEMPLATEVARS.login);
    return;
  }
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userID) {
    // If the URL exists, but doesn't belong to this user
    messageHandler.addGenericPermissionsError('delete');
    res.status(401).render('pages/urls_index', TEMPLATEVARS.urls_index);
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const id = helper.lookupUserByEmail(users, req.body.username);
  if (!id) {
    messageHandler.addLoginValidationError('No user with that email exists.');
    res.status(403).render('pages/login', TEMPLATEVARS.login);
    return;
  }
  if (!bcrypt.compareSync(req.body.password, users[id].password)) {
    messageHandler.addLoginValidationError('Incorrect login credentials.');
    res.status(403).render('pages/login', TEMPLATEVARS.login);
    return;
  }

  req.session.userID = id;
  // Add user to all templatevars
  helper.addToAll(TEMPLATEVARS, 'user', users[id]);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session.userID = null;
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
    messageHandler.addRegistrationError('No blank fields allowed!');
    res.status(400).render('pages/register', TEMPLATEVARS.register);
    return;
  }
  
  if (helper.emailExists(users, email)) {
    messageHandler.addRegistrationError('Sorry, that email is taken!');
    res.status(400).render('pages/register', TEMPLATEVARS.register);
    return;
  }
  // Add new user object
  users[userID] = {
    userID,
    email,
    username,
    password: bcrypt.hashSync(password, 10)
  };

  //Set templatevars
  helper.addToAll(TEMPLATEVARS, 'user', users[userID]);

  // Create cookie for this login
  req.session.userID = userID;

  // Redirect to /urls
  res.redirect('/urls');
});


/***********************************/
/** END OF ROUTING *****************/
/***********************************/

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});

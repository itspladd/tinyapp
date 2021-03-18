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
  const userID = req.session.user_id;
  if (!TEMPLATEVARS.home['user'] && userID && users[userID]) {
    const id = req.session.user_id;
    helper.addToAll(TEMPLATEVARS, 'user', users[id]);
  } else if (!users[userID]) {
    // If the current cookie's ID doesn't exist in our database, clear it.
    req.session.user_id = null;
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
    messageHandler.addError('bad_url',
      `URL ${shortURL} not found!`,
      () => res.redirect('/urls/not_found')
    );
  } else {
    res.redirect(longURL);
  }
});

app.get('/urls', (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    messageHandler.addError('login',
      'Login to see your URLs, or register an account to start creating them!',
      () => res.redirect('/login')
    );
  } else {
    TEMPLATEVARS.urls_index['urls'] = helper.urlsForUser(id, urlDatabase);
    res.render('pages/urls_index', TEMPLATEVARS.urls_index);
  }
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    messageHandler.addError('login', 'You have to log in to create a URL!',
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
  
  const id = req.session.user_id;
  if (!id) {
    messageHandler.addError('login',
      'Login to see your URLs, or register an account to start creating them!',
      () => res.redirect('/login')
    );
  } else if (urlDatabase[shortURL].userID !== id) {
    messageHandler.addError('urls_index',
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
  const userID = req.session.user_id;
  if (!userID) {
    messageHandler.addError('login',
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
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userID) {
    messageHandler.addError('login',
      `You have to log in to update a URL!`,
      () => res.redirect('/login')
    );
  } else if (!urlDatabase[shortURL]) {
    // If the URL doesn't exist
    messageHandler.addError('bad_url',
      `URL ${shortURL} not found!`,
      () => res.redirect('/login')
    );
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userID) {
    // If the URL exists, but doesn't belong to this user
    messageHandler.addError('login',
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
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userID) {
    messageHandler.addError('login',
      `You have to log in to delete a URL!`,
      () => res.redirect('/login')
    );
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userID) {
    // If the URL exists, but doesn't belong to this user
    messageHandler.addError('login',
      `You can't delete other users' URLs!`,
      () => res.redirect('/login')
    );
  } else {

    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const id = helper.lookupUserByEmail(users, req.body.username);
  if (!id) {
    res.status(403).send('User not found!');
  } else if (!bcrypt.compareSync(req.body.password, users[id].password)) {
    res.status(403).send('Incorrect login information.');
  } else {
    req.session.user_id = id;
    // Add username to all templatevars
    helper.addToAll(TEMPLATEVARS, 'user', users[id]);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
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
      password: bcrypt.hashSync(password, 10)
    };

    //Set templatevars
    helper.addToAll(TEMPLATEVARS, 'user', users[userID]);

    // Create cookie for this login
    req.session.user_id = userID

    // Redirect to /urls
    res.redirect('/urls');
  }
});


/***********************************/
/** END OF ROUTING *****************/
/***********************************/

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});

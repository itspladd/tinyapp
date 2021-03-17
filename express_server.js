const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const helper = require('./helpers');
const app = express();

const PORT = 8080;
const TEMPLATEVARS = require('./constants').TEMPLATEVARS;

// Our view engine is EJS
app.set('view engine', 'ejs');

// Body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'abcdef': 'http://www.lighthouselabs.ca',
  'ghijkl': 'http://www.google.com',
};

const users = {
  userID1: {
    id: 'userID1',
    email: 'user1@example.com',
    password: 'password1',
  },
  userID2: {
    id: 'userID2',
    email: 'user2@example.com',
    password: 'password2',
  }
}

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
  res.render('pages/urls_new', TEMPLATEVARS.urls_new);
});

app.get('/about', (req, res) => {
  res.render('pages/about', TEMPLATEVARS.about);
});

app.get('/register', (req, res) => {
  res.render('pages/register', TEMPLATEVARS.register);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  // If the retrieved longURL is undefined, go to the "url not found" page.
  if (!longURL) {
    TEMPLATEVARS.bad_url['shortURL'] = shortURL;
    res.render('pages/bad_url', TEMPLATEVARS.bad_url);
  } else {
    res.redirect(longURL);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
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
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

/**
 * Updates an existing shortURL with a new longURL
 */
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  // Set input vars
  const id = helper.randomString(10);
  const email = req.body.email;
  const password = req.body.password;

  // Add new user object
  users[id] = {
    id,
    email,
    password,
  };
  for (const user of Object.values(users)) {
    console.log(user);
  }
  // Create cookie for this login
  res.cookie('user_id', id);

  // Redirect to /urls
  res.redirect('/urls');
});


/***********************************/
/** END OF ROUTING *****************/
/***********************************/

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});

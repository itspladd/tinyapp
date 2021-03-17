const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const helper = require('./helpers');
const app = express();
const PORT = 8080;

// Our view engine is EJS
app.set('view engine', 'ejs');

// Body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'abcdef': 'http://www.lighthouselabs.ca',
  'ghijkl': 'http://www.google.com',
};





/***********************************/
/** ROUTING ************************/
/***********************************/

/**************************/
/** NON-RENDERING *********/
/**************************/
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

/**************************/
/** RENDERING *************/
/**************************/
app.get('/', (req, res) => {
  const templateVars = {
    title: 'TinyApp: A URL Shortener',
    username: req.cookies['username'],
  };
  res.render('pages/index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    title: 'TinyApp: Create a New Tiny URL',
    username: req.cookies['username'],
  };
  res.render('pages/urls_new', templateVars);
});

app.get('/about', (req, res) => {
  const templateVars = {
    title: 'TinyApp: About',
    username: req.cookies['username'],
  };
  res.render('pages/about', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    title: 'TinyApp: Register',
  };
  
  res.render('pages/register', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  // If the retrieved longURL is undefined, go to the "url not found" page.
  if (!longURL) {
    const templateVars = {
      title: 'TinyApp: Bad URL',
      username: req.cookies['username'],
      shortURL,
    };
    res.render('pages/bad_url', templateVars);
  } else {
    res.redirect(longURL);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = {
    shortURL,
    longURL,
    title: `TinyApp: URL ID ${shortURL}`,
    username: req.cookies['username'],
  };
  res.render('pages/urls_show', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    title: 'TinyApp: My URLs',
    username: req.cookies['username'],
    urls: urlDatabase,
    greeting: 'My URLs:'
  };
  res.render('pages/urls_index', templateVars);
});

/**************************/
/** POST ******************/
/**************************/

app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
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

app.post('/urls', (req, res) => {
  const shortURL = helper.randomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

/***********************************/
/** END OF ROUTING *****************/
/***********************************/

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});

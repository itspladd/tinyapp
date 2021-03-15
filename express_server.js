const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

// Our view engine is EJS
app.set('view engine', 'ejs');

// Body parser
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  data: { 
    'abcdef': 'http://www.lighthouselabs.ca',
    'ghijkl': 'http://www.google.com',
  }
};

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase.data,
    greeting: 'My URLs:'
  };
  res.render('pages/urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = randomString();
  urlDatabase.data[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
})

app.get('/urls/new', (req, res) => {
  res.render('pages/urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase.data[req.params.shortURL],
  };
  res.render('pages/urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase.data[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/about', (req,res) => {
  res.render('pages/about');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/howdy', (req, res) => {
  res.send('<html><body>Howdy, <h1>PARDNER</h1></body></html>');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});

const randomString = () => {
  let str = "";

  while (str.length < 6) {
    code = randInt(48, 90);
    if (!(code > 57 && code < 65)) {
      str += String.fromCharCode(code);
    }
  }

  return str;
}

const randInt = (min, max) => {
  return Math.floor((Math.random() * (max-min))) + min;
}
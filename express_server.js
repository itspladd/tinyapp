const express = require('express');
const app = express();
const PORT = 8080;

// Our view engine is EJS
app.set('view engine', 'ejs');

const urlDatabase = {
  data: { 
    'abcdef': 'http://www.lighthouselabs.ca',
    'ghijkl': 'http://www.google.com',
  },
  greeting: 'Here are your URLs!'
};

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/urls', (req, res) => {
  res.render('pages/urls_index', { 
    data: urlDatabase.data,
    greeting: urlDatabase.greeting });
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
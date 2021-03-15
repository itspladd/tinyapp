const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  'abcdef': 'http://www.lighthouselabs.ca',
  'ghijkl': 'http://www.google.com',
};

app.get('/', (req, res) => {
  res.send('Bloop!');
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
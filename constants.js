const PORT = 8080;

const titleBase = 'BabyURL: '

const TEMPLATEVARS = {
  home: {
    title: `${titleBase}A URL Shortener`,
  },
  about: {
    title: `${titleBase}About`,
  },
  login: {
    title: `${titleBase}Log In`,
  },
  register: {
    title: `${titleBase}Register`,
  },
  urls_index: {
    title: `${titleBase}My URLs`,
  },
  urls_new: {
    title: `${titleBase}Make a New URL`,
  },
  urls_show: {
    title: `${titleBase}URL ID`,
  },
  bad_url: {
    title: `${titleBase}Short URL Not Found`,
  },
};

module.exports = {
  TEMPLATEVARS,
};
/*****************
 *  HELPER FUNCTIONS
 */

// Creates a string of random alphanumeric (upper and lowercase) characters
// Length can be any length, default is 6
const randomString = (length = 6) => {
  let str = "";

  while (str.length < length) {
    let code = randInt(48, 122);
    if (!(code > 57 && code < 65) && !(code > 90 && code < 97)) {
      str += String.fromCharCode(code);
    }
  }

  return str;
};

// Generates a random integer between two values.
const randInt = (min, max) => {
  const range = (max - min) + 1;
  return Math.floor((Math.random() * range) + min);
};

// Adds the input key and value to every object within the input object.
// REQUIRES an object containing objects.
const addToAll = (target, key, value) => {
  // Check for input existence
  if (!target || !key || typeof target !== "object") {
    return undefined;
  }

  const nonObj = Object.values(target)
    .filter(obj => typeof obj !== "object" || Array.isArray(obj));
  if (nonObj.length !== 0) {
    throw new Error(`Error: addToAll requires an input of an object that contains only other objects. Bad data: ${nonObj}`);
  }
  Object.values(target).forEach(obj => obj[key] = value);
  return true;
};

// Adds the input key and value to every object within the input object.
// REQUIRES an object containing objects.
const removeFromAny = (target, key) => {
  if (!target || typeof target !== "object") {
    console.log('Bad argument given to removeFromAny');
    return undefined;
  }
  for (const obj of Object.values(target)) {
    delete obj[key];
  }
};

// Check if an email already exists in our user data.
const emailExists = (users, email) => {
  for (let id in users) {
    if (users[id].email === email) {
      return true;
    }
  }
  return false;
};

const lookupUserByEmail = (users, email) => {
  for (const id in users) {
    if (users[id].email === email) {
      return id;
    }
  }

  return undefined;
};

const urlsForUser = (id, urls) => {
  return Object.values(urls)
    .filter(url => url.userID === id);
};

module.exports = {
  randomString,
  addToAll,
  removeFromAny,
  emailExists,
  lookupUserByEmail,
  urlsForUser,
};
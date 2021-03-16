/*****************
 *  HELPER FUNCTIONS
 */

const randomString = () => {
  let str = "";

  while (str.length < 6) {
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

module.exports = {
  randomString,
};
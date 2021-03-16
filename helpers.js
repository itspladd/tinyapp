/*****************
 *  HELPER FUNCTIONS
 */

 const randomString = () => {
  let str = "";

  while (str.length < 6) {
    code = randInt(48, 122);
    if (!(code > 57 && code < 65) && !(code > 90 && code < 97)) {
      str += String.fromCharCode(code);
    }
  }

  return str;
}

// Generates a random integer between two values.
const randInt = (min, max) => {
  return Math.floor((Math.random() * (max-min + 1))) + min;
}

module.exports = {
  randomString,
};
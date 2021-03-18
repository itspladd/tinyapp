const assert = require('chai').assert;
const removeFromAny = require('../helpers.js').removeFromAny;

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    extra: "info"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    extra: "data"
  },
  "user23RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "dishwasher-funk",
  }
};

describe('#removeFromAny', () => {
  it(`should remove a key/value pair from every object within an input object, without modifying other data`, () => {
    const key = 'extra';

    const testUsersAfterRemoval = {
      "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
      },
      "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk",
      },
      "user23RandomID": {
        id: "user3RandomID",
        email: "user3@example.com",
        password: "dishwasher-funk",
      }
    };

    removeFromAny(testUsers, key);
    assert.deepEqual(testUsers, testUsersAfterRemoval);
  });
  it(`should return true for successful operation`, () => {
    const key = 'id';

    const testUsersAfterRemoval = {
      "userRandomID": {
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
      },
      "user2RandomID": {
        email: "user2@example.com",
        password: "dishwasher-funk",
      },
      "user23RandomID": {
        email: "user3@example.com",
        password: "dishwasher-funk",
      }
    };

    assert.isTrue(removeFromAny(testUsers, key));
    assert.deepEqual(testUsers, testUsersAfterRemoval);
  });
  it(`should throw an error if sent an object that doesn't contain objects`, () => {
    const badObj = {
      "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
      },
      "user2RandomID": ['hello', 'there']
    };
    
    assert.throws(function() {
      removeFromAny(badObj, 'password');
    }, `Error: Input contained non-object data. Bad data: ${badObj.user2RandomID}`);
  });
  it(`should return undefined for no input or missing values`, () => {
    assert.isUndefined(removeFromAny());
    assert.isUndefined(removeFromAny(testUsers));
  });
});
const assert = require('chai').assert;
const emailExists = require('../helpers.js').emailExists;

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// To be used for comparison - never passed into the function
const testUsersStatic = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


describe('#emailExists', () => {
  it(`should not modify the original database`, () => {
    emailExists(testUsers, "user@example.com");
    assert.deepEqual(testUsers, testUsersStatic);
  });
  it(`should return true if the given email already exists in the database`, () => {
    const input = 'user2@example.com';
    assert.isTrue(emailExists(testUsers, input));
  });
  it(`should return false if the given email is not in the database`, () => {
    const input = 'user3@example.com';
    assert.isFalse(emailExists(testUsers, input));
  });
  it(`should throw an error if the target is not an object containing other objects`, () => {
    const badObj = {
      "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
      },
      "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
      },
      "user3RandomID": [1, 2, 3]
    };
    

    assert.throws(function() {
      emailExists(badObj, "user2@example.com");
    }, `Error: Input contained non-object data. Bad data: ${badObj.user3RandomID}`);
  });
  it(`should return undefined for no input or missing values`, () => {
    assert.isUndefined(emailExists());
    assert.isUndefined(emailExists(testUsers));
  });
});
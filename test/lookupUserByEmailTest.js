const assert = require('chai').assert;
const lookupUserByEmail = require('../helpers.js').lookupUserByEmail;

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

describe('#lookupUserByEmail', () => {
  it(`should not modify the original data`, () => {
    lookupUserByEmail(testUsers, "user2@example.com")
    assert.deepEqual(testUsers, testUsersStatic);
  });
  it(`should return a user ID when given an email and an object of users including that email`, () => {
    const input = "user2@example.com";
    const expected = "user2RandomID";

    assert.equal(lookupUserByEmail(testUsers, input), expected);
  });
  it(`should return undefined if the email is not found`, () => {
    const input = "user3@example.com";
    
    assert.isUndefined(lookupUserByEmail(testUsers, input));
  });
  it(`should return undefined for nonexistent input`, () => {
    assert.isUndefined(lookupUserByEmail(testUsers));
    assert.isUndefined(lookupUserByEmail("user2@example.com"));
  });
  it(`should throw an error for input that is not an object containing objects`, () => {
    const badObj = {
      "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
      },
      "user2RandomID": ['hello', 'there']
    };

    assert.throws(function() {
      lookupUserByEmail(badObj, "user@example.com");
    }, `Error: Input contained non-object data. Bad data: ${badObj.user2RandomID}`);
  });
});
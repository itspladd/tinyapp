const assert = require('chai').assert;
const addToAll = require('../helpers.js').addToAll;

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

describe('#addToAll', () => {
  it(`should add a key/value pair to every object within an input object`, () => {
    const key = 'name';
    const value = 'Bob';
    addToAll(testUsers, key, value);
    for (let user of Object.values(testUsers)) {
      assert.equal(user.name, 'Bob');
    }
  });
  it(`should overwrite previous values for the same key`, () => {
    const key = 'name';
    const value = 'Ren';
    addToAll(testUsers, key, value);
    for (let user of Object.values(testUsers)) {
      assert.equal(user.name, 'Ren');
    }
  });
  it(`should return true for successful operation`, () => {
    const key = 'creator';
    const value = 'Pladd';
    assert.isTrue(addToAll(testUsers, key, value));
    for (let user of Object.values(testUsers)) {
      assert.equal(user.creator, 'Pladd');
    }
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
      addToAll(badObj, 'name', 'Pladd');
    }, `Error: Input contained non-object data. Bad data: ${badObj.user2RandomID}`);
  });
  it(`should return undefined for no input or missing values`, () => {
    assert.isUndefined(addToAll());
    assert.isUndefined(addToAll(testUsers));
  });
});
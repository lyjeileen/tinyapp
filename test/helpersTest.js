const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "test@test.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
  it("should return undefined with non-existent email", function () {
    const user = getUserByEmail("wrong@example.com", testUsers);
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

describe("urlsForUser", function () {
  it("should return an object containing the urls for a specific user id. The keys are short URLs and values are long URLs", function () {
    const validURLs = urlsForUser("aJ48lW", urlDatabase);
    const expectedURLs = {
      i3BoGr: "https://www.google.ca",
    };
    assert.deepEqual(validURLs, expectedURLs);
  });
  it("should return {} if database does not contain the urls for a specific user id. The keys are short URLs and values are long URLs", function () {
    const validURLs = urlsForUser("wrong", urlDatabase);
    const expectedURLs = {};
    assert.deepEqual(validURLs, expectedURLs);
  });
});

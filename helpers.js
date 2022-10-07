const getUserByEmail = function (email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

const toShortURL = function generateRandomString() {
  const alphanumericals =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result +=
      alphanumericals[Math.floor(Math.random() * alphanumericals.length)];
  }
  return result;
};

const urlsForUser = function (id, database) {
  let validURLs = {};
  for (url in database) {
    if (database[url].userID === id) {
      validURLs[url] = database[url].longURL;
    }
  }
  return validURLs;
};

module.exports = { getUserByEmail, toShortURL, urlsForUser };

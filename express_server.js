const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 8080;

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

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

const getUserByEmail = function (email) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect("urls");
  }
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect("urls");
  }
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const id = toShortURL();
  const { email, password } = req.body;
  let validRegister = true;
  if (!email || !password) {
    res.status(400).send("Please enter a valid email and password.");
    validRegister = false;
  }
  if (getUserByEmail(email)) {
    res.status(400).send("Please enter a new email address.");
    validRegister = false;
  }
  if (validRegister) {
    users[id] = { id, email, password };
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.send(
      "Only registered users can shorten URLs. Please log in first."
    );
  }
  let shortURL = toShortURL();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const user = users[getUserByEmail(req.body.email)];
  if (!getUserByEmail(req.body.email)) {
    return res.status(403).send("Please enter a valid email address");
  }
  if (req.body.password !== user.password) {
    return res.status(403).send("Incorrect password.");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.newURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Id does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

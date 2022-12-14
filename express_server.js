const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const PORT = 8080;
const { getUserByEmail, toShortURL, urlsForUser } = require("./helpers.js");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["secret"],
    maxAge: 60 * 60 * 1000,
  })
);

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
  x8ndHs: {
    id: "x8ndHs",
    email: "user@example.com",
    password: "$2a$10$CozJx3mThm0f50PneDetLOcQKt2suTusEWBA0hGZIB3/607Oub/wy",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "lyjeileen@gmail.com",
    password: "$2a$10$MOMgyC4R6NAJVqE6vF3Os.6q12dGuN6A4ANYlU/3qn.0OSwiUXuZe",
  },
};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("You are not logged in.");
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res
      .status(401)
      .send("Only registered users can shorten URLs. Please log in first.");
  }
  let shortURL = toShortURL();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("urls");
  }
  const templateVars = { user: undefined };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Please enter a valid email address");
  }

  const user = users[getUserByEmail(req.body.email, users)];
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Incorrect password.");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const id = toShortURL();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please enter a valid email and password.");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Please enter a new email address.");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("This URL does not exist.");
  }
  if (!req.session.user_id) {
    return res
      .status(401)
      .send("This page is only accessible to logged-in user.");
  }
  const validURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (!validURLs[req.params.id]) {
    return res.status(403).send("This URL does not belong to your account.");
  }
  const templateVars = {
    id: req.params.id,
    longURL: validURLs[req.params.id],
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send("Id does not exist.");
  }
  if (!req.session.user_id) {
    return res
      .status(401)
      .send("This page is only accessible to logged-in user.");
  }
  const validURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (!validURLs[id]) {
    return res
      .status(403)
      .send("Sorry, this URL does not belong to your account.");
  }

  urlDatabase[id].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Id does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send("Id does not exist.");
  }

  if (!req.session.user_id) {
    return res
      .status(401)
      .send("This page is only accessible to logged-in user.");
  }
  console.log(req.session.user_id);
  const validURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (!validURLs[id]) {
    return res
      .status(403)
      .send("Sorry, this URL does not belong to your account.");
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < charactersLength; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));

  }
  return result.substring(0, 6);
}

const getUserByEmail = require('./helpers');
const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ["anything"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.set("view engine", "ejs");
const urlDatabase_old = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const urlsForUser = function (id) {
  let urlsDisplay = {};
  //console.log("in urlsForUser, id:: " + id);
  for (let key in urlDatabase) {
    console.log("key ::** " + (id === urlDatabase[key].userID));
    if (id === urlDatabase[key].userID) {
      urlsDisplay[key] = {longURL:urlDatabase[key].longURL, userID: id};
    }
  }
  return urlsDisplay;
};

const users = {
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
}


app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    "id": userId,
    "email": email,
    "password": hashedPassword,
  }
  
  if (!password || !email) {
    res.status(403);
    res.send('Empty form');
  } else if (uniqueEmail() === false) {
    res.status(403);
    res.send('Email in use!');
  } else {
    users[userId] = newUser;
  req.session["user_id"] = userId;
    res.redirect('/urls');
  }
  function uniqueEmail() {
    for (let user in users) {
      if (users[user].email === email) {
        return false;
      }
    }
    return true;
  }
});

app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render('login', templateVars);
});


app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render('register', templateVars);
});


app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.updateUrl;
  const urlUserId = urlDatabase[shortURL].userID;
  console.log("valid id", urlDatabase[shortURL]);
  if(!userId){
    return res.send("you are not logged in");
  }
  if(userId !== urlUserId){
    return res.send("This is not your url");
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
  
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const urls = urlsForUser(userId);
    const id = req.params.id;
    const url = urls[id];
    if (url) {
    delete urlDatabase[id];
    }
    return res.redirect("/urls");
  } else{ 
    const templateVars = { user: users[req.session.user_id], message: "Couldn't delete url"};
   return res.render("error", templateVars );
  }
  res.redirect("/urls");
});



app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  let user;
  for (const userId in users) {
    console.log("In login, user id is:: " + userId);
    const currentUser = users[userId];
    if (email === currentUser.email && bcrypt.compareSync(password, currentUser.password)) {
      user = currentUser;
    }
  }
  if (!user) {
    res.status(400);
    res.send("Invalid User!");
    return;
  }
  console.log("user id :: " + user.id);
  console.log(req.body);

  req.session["user_id"] = user.id;
  res.redirect("/urls");
});



app.post("/urls", (req, res) => {

  console.log("Cookies in /urls :: " + req.session["user_id"]);
  console.log(req.body.longURL);  // Log the POST request body to the console
  const VerifyLogin = req.session.user_id;
  if (!VerifyLogin) {
    return res.send("you are not logIN");
   
  }
  const shortURL = generateRandomString();
  urlDatabase[`${shortURL}`] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect("/urls");
 
});

app.get("/urls/new", (req, res) => {


  const VerifyLogin = req.session.user_id;
  if (!VerifyLogin) {
    res.redirect("/login");
  }
  const templateVars = { user: users[req.session.user_id] };
  console.log(users[req.session.user_id]);
  res.render("urls_new", templateVars);
});


app.get("/urls", (req, res) => {
  let id = req.session.user_id;
  urlsDisplay = urlsForUser(id);
  console.log("Id:: " + id);
  console.log("Urls to display:: " + urlsDisplay.longURL);
  const templateVars = { urls: urlsDisplay, user: users[req.session.user_id], users: users };
  console.log(req.session.user_id);

  res.render("urls_index", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  console.log("hit the route");
  let lu = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: lu.longURL, user: users[req.session.user_id], users: users };
  
  res.render("urls_show", templateVars);
  
});

app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]) {

    let su = req.params.shortURL;
    const longURL = urlDatabase[su].longURL;
    console.log(longURL);
  return res.redirect(longURL);
  } else {
    return res.send("<html><body>Short URL Not Found</body></html>\n");
  }
  
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


console.log(generateRandomString());
console.log(generateRandomString());
console.log(generateRandomString());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

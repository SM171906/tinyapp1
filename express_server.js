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


const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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
//const userId = req.cookies['user_id'];

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const newUser = {
    "id": userId,
    "email": email,
    "password": password,
  }
  //let user_id;
  if (!password || !email) {
    res.status(403);
    res.send('Empty form');
  } else if (uniqueEmail() === false) {
    res.status(403);
    res.send('Email in use!');
  } else {
    users[userId] = newUser;
    res.cookie("user_id", userId);
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
  const userId = req.cookies.user_id;
  if(userId){
    res.redirect("/urls");
  }
  const templateVars = {user : null};
  res.render('login', templateVars);
});


app.get('/register', (req, res) => {
  const userId = req.cookies.user_id;
  if(userId){
    res.redirect("/urls");
  }
  const templateVars = {user : null};
  res.render('register', templateVars);
});

app.post("/urls/:id", (req, res) => {

  console.log(req.params, "edit");
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
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
    if (email === currentUser.email && password === currentUser.password) {
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

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(req.params.shortURL);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {

  console.log("Cookies in /urls :: " + req.cookies["user_id"]);
  console.log(req.body.longURL);  // Log the POST request body to the console
  const VerifyLogin = req.cookies.user_id;
  if (!VerifyLogin) {
    res.send("you are not logIN");
  }
  const shortURL = generateRandomString();
  urlDatabase[`${shortURL}`] = {
    longURL: req.body.longURL,
      userID: req.cookies.user_id
  }
  res.redirect("/urls");
  res.send("Ok");
  // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {


  const VerifyLogin = req.cookies.user_id;
  console.log("@@@@" + VerifyLogin);
  if (!VerifyLogin) {
    res.redirect("/login");
  }
  const templateVars = { user : users[req.cookies.user_id]};
  console.log(users[req.cookies.user_id]);
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const lu = urlDatabase[req.params.id.longURL];
  const templateVars = { shortURL: req.params.id, longURL: lu, user: users[req.cookies.user_id], users: users };

  res.render("urls_show", templateVars);
});




app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id], users: users };
  console.log(req.cookies.user_id);
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let lu = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: lu, user: users[req.cookies.user_id], users: users };
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

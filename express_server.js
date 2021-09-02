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
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.post('/register', (req, res) =>{
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // const currentUser = users[userId];
  // const userFound = currentUser;
  // if (email === " " || password === " "){
  //   return res.send('400 Bad Request');
  // }else if (userFound){
  //   return res.send('400 Bad Request');
  // }
  const newUser = {
    id: userId,
    email,
    password,
  };
  users[userId] = newUser;
  console.log(users);
  //res.cookie('user_id', userId);
  res.redirect("/login");
  
});

app.get('/login', (req, res) =>{
  res.render('login');
});


app.get('/register', (req, res) => {
  res.render('register');
});

app.post("/urls/:id", (req, res) => {
 
  console.log(req.params, "edit");
  res.redirect("/urls");
});
app.post("/logout", (req,res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user_id;
  for(const userId in users){
    console.log(userId);
    const currentUser = users[userId];
   if(email === currentUser.email && password === currentUser.password){
    user_id = currentUser;
   }
  }
  if(!user_id){
    res.status(400);
    res.send("Invalid User!");
    return;
  }
  console.log("user_id", user_id);
  console.log(req.body);
  // const input = req.body["username"];
  // console.log(req.body);
  // //console.log(req.cookies);
   res.cookie("username", user_id.id);
   res.cookie("user_id", user_id.id);
  
  // console.log("Cookies :: " + req.cookies["username"]);
  
  //res.cookie('username',input, { maxAge: 900000, httpOnly: true });
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(req.params.shortURL);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  
  console.log("Cookies in /urls :: " + req.cookies["username"]);
  console.log(req.body.longURL);  // Log the POST request body to the console
  res.send("Ok");    
      // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:id", (req, res) => {
 const lu = urlDatabase[req.params.id];
  const templateVars = { shortURL: req.params.id, longURL: lu, users: users};
  
  res.render("urls_show", templateVars);
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], users: users };
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let lu = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: lu, users: users };
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

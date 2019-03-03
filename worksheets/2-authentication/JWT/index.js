const express = require('express')
const app = express();
const port = 3000;
const massive = require('massive');
var jwt = require('jsonwebtoken');
let conn = require('./conn.json');
var cookieParser = require('cookie-parser');


app.use(cookieParser());

massive({
  host: conn.host,
  port: conn.port,
  database: conn.database,
  user: conn.user,
  password: conn.password,
  poolSize: conn.poolSize
}).then(instance => {
  console.log("Database Connected");
  app.set('db', instance);
});


app.get('/', (req, res) => res.send('What\'s up world World!'))

app.get('/login', function (req, res) {
  var user = req.query.username;
  var pass = req.query.password;
  req.app.get('db').query('SELECT * FROM findUser(\''+user+'\',\''+pass+'\');')
  .then(items => {
    if(items[0]['finduser'] != null){
      var user = {id: items[0]['finduser']};
      const token = jwt.sign({ jti: user.id }, conn.secret_key, { expiresIn: '24h' });
      res.cookie('auth',token);
      res.json({
        message: 'Access Granted',
        token: token
      });
    }else{
      res.json("Login Failed");
    }
    
  });
});

app.get('/products', ensureToken, function (req, res) {
  
  res.json({
    description: 'Welcome to Products'
  });
});

function ensureToken(req, res, next) {
  var cookie = req.cookies.auth;
  if (typeof cookie !== 'undefined') {
    req.token = cookie;
    jwt.verify(req.token, conn.secret_key, function(err, data) {
      if (err) {
        console.log("Token Error")
        res.sendStatus(403);
      } else {
        next(); 
      }
    });
  } else {
    console.log("Undefined Token");
    res.sendStatus(403);
  }
}

app.get('/checkCookie',  function (req, res) {
  var cookie = req.cookies.auth;
  if(cookie){
    res.send("Yes" + cookie);
  }else{
    res.send("Someone ate all the cookies..");
  }
});


app.get('/clearCookie',  function (req, res) {
  res.clearCookie("auth");
  res.send("Cookie cleared");
});

app.listen(port, () => console.log(`Connected on ${port}!`))



// CREATE TABLE users (
    // ID int NOT NULL PRIMARY KEY,
    // username varchar(255),
    // password varchar(255)
// );

// CREATE TABLE products (
    // ID int NOT NULL PRIMARY KEY,
    // name varchar(255),
    // price varchar(255)
// );

// create extension pgcrypto;

// INSERT INTO users (id, username, password) VALUES (7, 'benny', crypt('pass123', gen_salt('bf', 8)));
// INSERT INTO users (id, username, password) VALUES (8, 'billy', crypt('pass123', gen_salt('bf', 8)));
// INSERT INTO users (id, username, password) VALUES (9, 'bobby', crypt('pass123', gen_salt('bf', 8)));

// INSERT INTO products (id, name, price) VALUES (7, 'p1', '12.00');
// INSERT INTO products (id, name, price) VALUES (8, 'p2', '13.00');
// INSERT INTO products (id, name, price) VALUES (9, 'p3', '10.00');

// SELECT * FROM users WHERE username='user1' AND password = crypt('pass123', password);


// CREATE OR REPLACE FUNCTION findUser(_username TEXT, _passwd TEXT)
// RETURNS int
// AS $$
    // SELECT u.id
    // FROM users u
    // WHERE u.username = _username
    // AND u.password = crypt(_passwd, u.password);
// $$ LANGUAGE SQL STRICT IMMUTABLE;
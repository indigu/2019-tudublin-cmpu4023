const express = require('express')
const app = express();
const port = 3000;
const massive = require('massive');


massive({
  host: 'localhost',
  port: 5432,
  database: 'pgguide',
  user: 'matto',
  password: 123456,
  poolSize: 10
}).then(instance => {
  console.log("Connected to the database");
  app.set('db', instance);
});
app.get('/', (req, res) => res.send('Hello World!'))


// List all users email and sex in order of most recently created. Do not include password hash in your output
app.get('/users', function (req, res) {
  req.app.get('db').query(
    'select email, details -> \'sex\' AS sex from users ORDER BY created_at DESC;'
  ).then(tests => {
    res.json(tests)
  });
});


// Get certain user
app.get('/users/:id', function (req, res, next) {
  req.app.get('db').query('select email, details -> \'sex\' AS sex from users where id = ${id} order by created_at desc;', {
    id: req.params.id
  }).then(tests => {
    res.send(tests)// all tests matching the criteria
  });
});

// List all products in ascending order of price
app.get('/products', function (req, res) {

  app.get('db').products.find({

  }
    , {
      order: [{ field: "price", direction: "asc" }]
    }).then(products => res.send(products));


})


// Example of product retrieval that is prone to sql injection
app.get('/bad/products', function (req, res, next) {
  var title_name = req.query.name;
  var query = 'select * from products WHERE title = \'' + title_name + '\' ';
  console.log(query)
  try {
    req.app.get('db').query('select * from products WHERE title = \'' + title_name + '\'')
      .then(tests => {
        res.send(tests)
      })
  } catch (err) {
    res.json(err);
  }
});
// SQL injection example
// http://localhost:3000/bad/products/?name=%27%20or%201=%271



// Get a certain product
app.get('/products/:id', (req, res) => {
  req.app.get('db').products.find({ 'id =': req.params.id }).then(products => {
      res.json(products);
  });
});


// Get all purchases
app.get('/purchases', function (req, res) {
  req.app.get('db').query(
    "select name, address, price, quantity, purchase_items.state from purchases join purchase_items on purchases.id = purchase_items.purchase_id order by price asc;"

  ).then(tests => {
    res.send(tests);
  });

});

// Solution with parameterised query
app.get('/parameterisedQuery', (req, res) => {
  var title_name = req.query.title;
  req.app.get('db').query("SELECT * FROM products WHERE title = ${title}",{
    title: title_name
  }).then(tests => {
    res.send(tests);
  });
});


// Solution with stored procedure
app.get('/storedProcedure', (req, res) => {
  var title_name = req.query.title;
  req.app.get('db').query("SELECT * FROM getProductByTitle(\'" + title_name + "\');"
  ).then(tests => {
    res.send(tests);
  });
});

// CREATE FUNCTION getProductByTitle(_title TEXT) RETURNS setof products as $$
// SELECT * FROM products where title = _title;
// $$ LANGUAGE SQL STRICT IMMUTABLE;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
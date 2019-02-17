const express = require('express')
const app = express();
const port = 3000;
const Seq = require('sequelize')
let conn = require('./conn.json');
const models = require('./models')

const sequelize = new Seq({
    username: conn.user,
    password: conn.password,
    database: conn.database,
    host: conn.host,
    dialect: 'postgres',
    define: {
        underscored: true,
        timestamps: false,
    }
})


/*
sequelize model:create --name products --attributes 'title:string price:float tags:string',

sequelize model:create --name purchase_items --attributes 'purchase_id:integer product_id:integer price:float quantity:integer state:string',

sequelize model:create --name purchases --attributes 'name:string address:string state:string zipcode:integer user_id:integer',

sequelize model:create --name users --attributes 'email:string password:string details:string;,
*/



// models.users.create({
     // id: 69,
     // email: 'aries@mydit.ie',
      // password: 'abc123',
      // details: '"sex"=>"M"'
// });
// models.products.create({
   // id: 79,
    // title: 'Nintendo Switch',
    // price: '350.00',
    // tags: ['Technology']
// });
// models.purchases.create({
   // name: 'Aries Martin',
    // address: '52 Davis Court ',
    // state: "AA",
    // zipcode:45546,
    // user_id: 69
// });

// models.purchase_items.create({
   // purchase_id: 1002,
   // product_id:79,
   // price: '350.00',
   // quantity: 1,
   // state: "Delivered"
// });

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

//List all products
app.get('/products', (req, res) => {
    var product = req.query.prodname;

    if (product) {
        models.products.findAll({
            where: {
                title: product
            }
        }).then(product => {
            res.send(product)
        });
    } else {
        models.products.findAll().then(products => {
            res.send(products);
        });
    }

    
});

//Show details of the specified products
app.get('/products/:id', (req, res) => {
    var id = req.params.id;
    models.products.findOne({ where: { id: id } }).then(product => {
        res.send(product);
    })
});


//Create a new product instance
//localhost:3000/products?title=Volvic&price=2&tags=Food
app.post('/products', function (req, res) {
    var title = req.query.title;
    var price = req.query.price;
    var tags = [];
    tags.push(req.query.tags);

    models.products.create({
        title: title,
        price: price,
        tags: tags
    }).then(product => {
        res.send(product);
    })

});

//Update an existing product
//localhost:3000/products/23?price=200
app.put('/products/:id', (req, res) => {
    var id = req.params.id;
    var price = req.query.price;
    models.products.update({
        price: price,
    }, {
            where: {
                id: id
            }
        }).then(product => {
            models.products.findOne({
                where: {
                    id: id
                }
            }).then(product => {
                res.send(product);
            })
        });
});

//Remove an existing product
//localhost:3000/products/20
app.delete('/products/:id', (req, res) => {
    var id = req.params.id;
    models.products.findOne({
        where: {
            id: id
        }
    }).then(product => {
        models.products.destroy({
            where: {
                id: id
            }
        }).then(deleted => {
            if (deleted == 1) {
                res.send(product);
            } else {
                res.send("error");
            }
        })
    });

});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const express = require('express')
const app = express();
const port = 3000;
const massive = require('massive');
const bodyParser = require('body-parser');

const http = require('http');

let conn = require('./conn.json');
const crypto = require('crypto');


app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());


massive({
    host: conn.host,
    port: conn.port,
    database: conn.database,
    user: conn.user,
    password: conn.password,
    poolSize: conn.poolSize
}).then(instance => {
    console.log("Connected to the database");
    app.set('db', instance);
});

// Each request, we get three things; access key, signature, and the message
function check_sig(req, res, next) {

    var access_key = req.headers['access_key'];
    var sig = req.headers['signature'];
    var msg = req.query.msg;
    let mes = req.body.message;

    console.log("Access Key Recieved: " + access_key);
    console.log("Signature Recieved: " + sig);

    app.get('db').query(
        'SELECT * FROM users WHERE access_key= \'' + access_key + '\''
    ).then(user => {
        // If a user exits
        if (user[0] !== undefined) {
            var secKey = user[0]['secret_key'];
            const HMAC = crypto.createHmac('sha256', secKey);
			// checks if a user exists, retrieves the specific user's key and creates an HMAC encryption with it

            if (mes !== undefined) {
                console.log("Message sent: " + mes);
                HMAC.update(mes); 
				// Encrypts message with hash signature
				
            } else {
                // //If a query parameter is passed in the request of the body 
                if (msg !== undefined) {
                    console.log("Message sent as parameter: " + msg);
                    HMAC.update(msg);
                }
				// Query parameter passed as part of message, we then add the message to the previously hashed value
				
            }
			// HMAC uses the known secret key and message, uses it to calculate signature
            const serverSig = HMAC.digest('hex');
            console.log("Calculated signature: " + serverSig);
			// checks if client's passed signature is the same with server's calculated hashed signature 

            if (sig === serverSig) {
                console.log('Matching Signatures: Access Granted\n');
                next();
            } else {
                console.log('Mismatched Signatures: Access Denied\n');
                return res.status(401).send("Mismatched Signature: Access Denied\n");
            }
        } else {
            console.log('Access key invalid');
            return res.status(401).send("Mismatched Access Key: Access Denied\n");
        }
    });
}

app.get('/', check_sig, (req, res) => res.send('Access Granted!'))


// automated check 
app.get('/check', function (req, res) {
    var clientAccessKey = '1fad2e43de9d6b4d8b0711f499b7b1b445170b6a';
    var clientSecretKey = 'b530bd4f34e27c6257aeaae10ed0403dc66c0a22ab4788f6869abb6756a73a78138bcdfe03e61411';
    var clientMes = 'Encrypted';
    const HMAC = crypto.createHmac('sha256', clientSecretKey); 
	//create HMAC with the secret key
    HMAC.update(clientMes);
    const client_calculated_signature = HMAC.digest('hex');
    console.log();
    console.log("Access key:" + clientAccessKey);
    console.log("Signature: " + client_calculated_signature);
    console.log("Message:" + clientMes);
    console.log();
    const options = {
        hostname: 'localhost',
        port: port,
        path: "http://localhost:3000/?msg=" + clientMes,
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Access_Key': clientAccessKey,
            'Signature': client_calculated_signature
        }
    };
    const req1 = http.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (d) => {
            process.stdout.write(d)
        })
    })

    req1.on('error', (error) => {
        console.error('Error:' + error);
    })

    req1.end()
    res.status(200).send("Sent Successfully");
});

app.listen(port, () => console.log(`Connected on port ${port}!`))



// CREATE TABLE users(
//     ID int NOT NULL PRIMARY KEY,
//     username varchar(255),
//     password varchar(255),
//     access_key varchar(40),
//     secret_key varchar(80)
// );


// create extension pgcrypto;

// access key: ripemd160 
// secret key : ripemd320
// signature key: SHA256

// INSERT INTO users (id, username, password, access_key, secret_key) VALUES (1, 'user1', crypt('password1', gen_salt('bf', 8)), '1fad2e43de9d6b4d8b0711f499b7b1b445170b6a' ,'b530bd4f34e27c6257aeaae10ed0403dc66c0a22ab4788f6869abb6756a73a78138bcdfe03e61411');
// INSERT INTO users (id, username, password, access_key, secret_key) VALUES (2, 'user2', crypt('password2', gen_salt('bf', 8)), '02786db0e65e76bd8043031f6a6292cbc763d010', 'a567c93b972b7b9ab9db6a9c1cdbea962116ef2e36da739fb98880cc084455085c3ffa787e1b9a9e');
// INSERT INTO users (id, username, password, access_key, secret_key) VALUES (3, 'user3', crypt('password3', gen_salt('bf', 8)), '99a8487019099bee8af8473134fa247c2f018790', '98ce2a74d2829821fec0b1048c3b73e88515c0999b329b7a0a8b09ab9ed72ba64301d3dff0975657');

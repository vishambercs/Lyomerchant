var express             = require('express');
const mongoose          = require('mongoose');
const bodyParser        = require('body-parser');
var client              = require('./Route/clientsRoute');
var clientTokenRoute    = require('./Route/clientTokenRoute');
var Utility             = require('./common/Utility');
const fs                = require('fs');
var path                = require('path');
const Web3              = require('web3');
var cron                = require('node-cron');
const webSocketServer   = require('websocket').server;
const WebSocketClient   = require('websocket').client;
var app                 = express();
const https             = require('http');
var os                  = require('os');
require('dotenv').config()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization,Token");
    next();
});

app.get('/', function (req, res) { res.send('Welcome to Lyo Merchant'); });
app.use('/', client);
app.use('/topup', clientTokenRoute);


app.listen(process.env.SERVER_PORT, function () {
    console.log(`Example app listening at ${process.env.SERVER_PORT}`);
});




var topupserver = https.createServer({}).listen(process.env.TOP_UP_PORT, () => {
console.log(`Example app listening at ${process.env.TOP_UP_PORT}`);
})
const topupserverdata = new webSocketServer({ httpServer: topupserver });
topupserverdata.on('request', Utility.topupWebScokect)




// var client = new WebSocketClient();
// client.on('connectFailed', function(error) {
//     console.log('Connect Error: ' + error.toString());
// });
// client.on('connect', function(connection) {
//     console.log('Connection established!');
    
//     connection.on('error', function(error) {
//         console.log("Connection error: " + error.toString());
//     });
    
//     connection.on('close', function() {
//         console.log('Connection closed!');
//     });
    
//     connection.on('message', function(message) {
//         connection.send(message.utf8Data);
//         console.log("Current time on server is: '" + message.utf8Data + "'");
//     });
// });

// client.connect('ws://10.101.12.136:3011?transkey=0x0548f59fee79f8832c299e01dca5c76f034f558e&apikey=8541cf5816f284cbee0220659c2e4575a9d4d3f8&network_id=8541cf5816f284cbee0220659c2e4575a9d4d3f8&amount=1', '' ,"");


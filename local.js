var express             = require('express');
const mongoose          = require('mongoose');
const bodyParser        = require('body-parser');
var client              = require('./Route/clientsRoute');
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



app.listen(process.env.SERVER_PORT, function () {
    console.log(`Example app listening at ${process.env.SERVER_PORT}`);

   
});




var topupserver = https.createServer({}).listen(process.env.TOP_UP_PORT, () => {
console.log(`Example app listening at ${process.env.TOP_UP_PORT}`);
})
const topupserverdata = new webSocketServer({ httpServer: topupserver });
topupserverdata.on('request', Utility.topupWebScokect)





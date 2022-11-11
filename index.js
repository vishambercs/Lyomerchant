var express             = require('express');
const fileUpload        = require('express-fileupload');
const fs                = require('fs');
var path                = require('path');
const Web3              = require('web3');
var cron                = require('node-cron');
const webSocketServer   = require('websocket').server;
var app                 = express();
const https             = require('http');
const Utility           = require('./common/Utility');
var os                  = require('os');
const mongoose          = require('mongoose');
require('dotenv').config()
app.use(fileUpload());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => 
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization,Token");
    next();
});

app.listen(process.env.SERVER_PORT, function () {
    console.log(`Example app listening at ${process.env.SERVER_PORT}`);
});

mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });
mongoose.connection.once('open', function () {
    console.log('Database connected Successfully');
}).on('error', function (err) {
    console.log('Error', err);
})

var topupserver = https.createServer({}).listen(process.env.TOP_UP_PORT, () => 
{
console.log(`Example app listening at ${process.env.TOP_UP_PORT}   `);
})

const topupserverdata = new webSocketServer({ httpServer: topupserver });
topupserverdata.on('request', Utility.addressBalance)







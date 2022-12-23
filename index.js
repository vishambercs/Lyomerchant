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
const https             = require('https');
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

const privateKey   = fs.readFileSync('/etc/letsencrypt/live/cpgapi.pulseworld.com/privkey.pem',  'utf8');
const certificate  = fs.readFileSync('/etc/letsencrypt/live/cpgapi.pulseworld.com/cert.pem',     'utf8');
const ca           = fs.readFileSync('/etc/letsencrypt/live/cpgapi.pulseworld.com/fullchain.pem',    'utf8');

app.get('/', function (req, res) { res.send('Welcome '); });
app.use('/', client);
app.use('/topup', clientTokenRoute);



app.listen(process.env.SERVER_PORT, function () {
    console.log(`Example app listening at ${process.env.SERVER_PORT}`);

   
});




var topupserver = https.createServer({
    key                 :  privateKey,
    cert                :  certificate,  
    ca                  :  ca, 
    requestCert         :  false, 
    rejectUnauthorized  :  false

}).listen(process.env.TOP_UP_PORT, () => {
console.log(`Example app listening at ${process.env.TOP_UP_PORT}`);
})

const topupserverdata = new webSocketServer({ httpServer: topupserver });
topupserverdata.on('request', Utility.topupWebScokect)


const weweprivateKey   = fs.readFileSync('/etc/letsencrypt/live/finapi.weweglobal.io/privkey.pem',  'utf8');
const wewecertificate  = fs.readFileSync('/etc/letsencrypt/live/finapi.weweglobal.io/cert.pem',     'utf8');
const weweca           = fs.readFileSync('/etc/letsencrypt/live/finapi.weweglobal.io/fullchain.pem',    'utf8');



var weweserver = https.createServer({
    key                 :  weweprivateKey,
    cert                :  wewecertificate,  
    ca                  :  weweca, 
    requestCert         :  false, 
    rejectUnauthorized  :  false

}).listen(process.env.WEWE_PORT, () => {
console.log(`Example app listening at ${process.env.WEWE_PORT}`);
})

const weweserverdata = new webSocketServer({ httpServer: weweserver });
weweserverdata.on('request', Utility.topupWebScokect)



const Topup_lyo_privateKey   = fs.readFileSync('/etc/letsencrypt/live/fapi.lyomerchant.com/privkey.pem',  'utf8');
const Topup_lyo_certificate  = fs.readFileSync('/etc/letsencrypt/live/fapi.lyomerchant.com/cert.pem',     'utf8');
const Topup_lyo_ca           = fs.readFileSync('/etc/letsencrypt/live/fapi.lyomerchant.com/fullchain.pem',    'utf8');



var Topup_lyoserver     = https.createServer({
    key                 :  Topup_lyo_privateKey,
    cert                :  Topup_lyo_certificate,  
    ca                  :  Topup_lyo_ca, 
    requestCert         :  false, 
    rejectUnauthorized  :  false

}).listen(process.env.LYOMERCHANT_TOPUP_PORT, () => {
console.log(`Example app listening at ${process.env.LYOMERCHANT_TOPUP_PORT}`);
})

const Topup_lyoserverdata = new webSocketServer({ httpServer: Topup_lyoserver });
Topup_lyoserverdata.on('request', Utility.topupWebScokect)







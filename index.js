var express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var client = require('./Route/clientsRoute');
var poolRoute = require('./Route/poolRoute');
var networkRoute = require('./Route/networkRoute');
var walletRoute = require('./Route/poolwalletRoute');
var hotWalletRoute = require('./Route/hotWalletRoute');
var withdrawRoute = require('./Route/withdrawRoute');
var adminRoute = require('./Route/adminRoute');
var cornJobs = require('./common/cornJobs');
var path = require('path');
const Web3 = require('web3');
var cron = require('node-cron');
const webSocketServer = require('websocket').server;
var app = express();
// const https              = require('https');
const https = require('http');
const Utility = require('./common/Utility');

require('dotenv').config()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    next();
});

app.get('/', function (req, res) { res.send('Welcome to Lyo Merchant'); });
app.use('/v1', client);
app.use('/admin/v1', poolRoute);
app.use('/network/v1', networkRoute);
app.use('/wallet/v1', walletRoute);
app.use('/hotWallet/v1', hotWalletRoute);
app.use('/withdraw/v1', withdrawRoute);
app.use('/admin/v1', adminRoute);


// cron.schedule('* * * * *', cornJobs.Balance_Cron_Job);

//Database


mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });
mongoose.connection.once('open', function () {
    console.log('Database connected Successfully');
}).on('error', function (err) {
    console.log('Error', err);
})
app.listen(process.env.SERVER_PORT, function () {
    console.log('Listening to Port 5000');
});

var server = https.createServer().listen(process.env.SCOKECT_PORT, () => {
    console.log(`Example app listening at ${process.env.SCOKECT_PORT}`);
})
const wsServer = new webSocketServer({ httpServer: server });

wsServer.on('request', Utility.receiveMessage)


var kycserver = https.createServer().listen(process.env.KYC_PORT, () => {
    console.log(`Example app listening at ${process.env.KYC_PORT}`);
})
const kyc = new webSocketServer({ httpServer: kycserver });

kyc.on('request', Utility.approvekyc)
var express           = require('express');
const mongoose        = require('mongoose');
const bodyParser      = require('body-parser');
var client            = require('./Route/clientsRoute');
var poolWallet        = require('./Models/poolWallet');
var network           = require('./Models/network');
var poolRoute         = require('./Route/poolRoute');
var networkRoute      = require('./Route/networkRoute');
var walletRoute       = require('./Route/poolwalletRoute');
var payLinkRoute      = require('./Route/paylinkRoute');
var hotWalletRoute    = require('./Route/hotWalletRoute');
var withdrawRoute     = require('./Route/withdrawRoute');
var adminRoute        = require('./Route/adminRoute');
var Constant          = require('./common/Constant');
var cornJobs          = require('./common/cornJobs');
const fileUpload      = require('express-fileupload');
const listEndpoints   = require('express-list-endpoints')
const fs              = require('fs');
var path              = require('path');
const Web3            = require('web3');
var cron              = require('node-cron');
const webSocketServer = require('websocket').server;
const WebSocketClient = require('websocket').client;
var app = express();
const https = require('http');
const Utility = require('./common/Utility');
var os = require('os');
require('dotenv').config()

app.use(fileUpload());
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
app.use('/v1', client);

app.use('/admin/v1', poolRoute);
app.use('/network/v1', networkRoute);
app.use('/paymentlink/v1', payLinkRoute);
app.use('/wallet/v1', walletRoute);
app.use('/hotWallet/v1', hotWalletRoute);
app.use('/withdraw/v1', withdrawRoute);
app.use('/admin/v1', adminRoute);

mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });

mongoose.connection.once('open', function () {
    console.log('Database connected Successfully');
}).on('error', function (err) {
    console.log('Error', err);
})


app.listen(process.env.SERVER_PORT, async function () {
    
    Constant.ALL_API = listEndpoints(app)
    console.log(`Example app listening at ${process.env.SERVER_PORT}`);
});

var server = https.createServer().listen(process.env.SCOKECT_PORT, () => {
    console.log(`Example app listening at ${process.env.SCOKECT_PORT}`);
})

const wsServer = new webSocketServer({ httpServer: server });

wsServer.on('request', Utility.receiveMessage)

var kycserver = https.createServer().listen(process.env.KYC_PORT, () => {
    console.log(`Example app listening at ${process.env.KYC_PORT}   `);
})
const kyc = new webSocketServer({ httpServer: kycserver });
kyc.on('request', Utility.approvekyc)

var posTranscationserver = https.createServer({
    }).listen(process.env.POS_TRANSCATION, () => {
    console.log(`Example app listening at ${process.env.POS_TRANSCATION}   `);
})

const posTranscation = new webSocketServer({ httpServer: posTranscationserver });
posTranscation.on('request', Utility.posTranscationWebScokect)

var paymentLinkTranscationserver = https.createServer({
}).listen(process.env.PAYMENT_LINK_PORT, () => {
console.log(`Example app listening at ${process.env.PAYMENT_LINK_PORT}`);
})

const paymentLinkTranscation = new webSocketServer({ httpServer: paymentLinkTranscationserver });
paymentLinkTranscation.on('request', Utility.paymentLinkTranscationWebScokect)


var topupserver = https.createServer({}).listen(process.env.TOP_UP_PORT, () => {
console.log(`Example app listening at ${process.env.TOP_UP_PORT}`);
})
const topupserverdata = new webSocketServer({ httpServer: topupserver });
topupserverdata.on('request', Utility.topupWebScokect)





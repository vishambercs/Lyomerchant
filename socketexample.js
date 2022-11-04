// var express             = require('express');
// const mongoose          = require('mongoose');
// const bodyParser        = require('body-parser');
// var client              = require('./Route/clientsRoute');
// var poolRoute           = require('./Route/poolRoute');
// var networkRoute        = require('./Route/networkRoute');
// var walletRoute         = require('./Route/poolwalletRoute');
// var payLinkRoute        = require('./Route/paylinkRoute');
// var hotWalletRoute      = require('./Route/hotWalletRoute');
// var withdrawRoute       = require('./Route/withdrawRoute');
// var adminRoute          = require('./Route/adminRoute');
// var cornJobs            = require('./common/cornJobs');
// var Constant            = require('./common/Constant');
// const fileUpload        = require('express-fileupload');
// const fs                = require('fs');
// var path                = require('path');
// const Web3              = require('web3');
// var cron                = require('node-cron');
// const webSocketServer   = require('websocket').server;
// var app                 = express();
// const https             = require('http');
// const Utility           = require('./common/Utility');
// var os                  = require('os');
// require('dotenv').config()
// app.use(fileUpload());
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => 
// {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization,Token");
//     next();
// });

// app.listen(3000, function () {
//     console.log(`Example app listening at ${3000}`);
//     // const WEB3 = new Web3(new Web3.providers.HttpProvider("wss://bsc-ws-node.nariox.org:443"))
//     // const WEB3 = new Web3("wss://mainnet.infura.io/ws/v3/31ba6edababf4967a5bbbd65b6c4af37")
//     // const contract = new WEB3.eth.Contract(Constant.USDT_ABI, "0xf5eb513a31af1af797e3514a713ccc11492fb2df");
//     // let options = {
//     //     fromBlock: 0,
//     //     address: "0xEe62aE4457360FaFD6CeA0598FE119018fA62a0c",     // Only get events from specific addresses
//     //     topics: []                                                   // What topics to subscribe to
//     // };

//     // let subscription = WEB3.eth.subscribe('logs', options,(err,event) => {
//     //     if (!err)
//     //     console.log("subscribe",event)
//     // });
//     // subscription.on('data', event => console.log("subscribe event",event))
//     // subscription.on('changed', changed => console.log("changed event", changed))
//     // subscription.on('error', err => { console.log("changed err",err) })
//     // subscription.on('connected', nr => console.log("changed nr",nr))
    
// const url = 'wss://ws-nd-702-556-899.p2pify.com/7f0daa4e61d85154c6cae4bfc43d8d26';
// const web3 = new Web3(url);

// var options = {
//     address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
//     topics: [
//         '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
//     ]
// };

// var subscription = web3.eth.subscribe('logs', options, function(error, result){
//     if (!error) console.log('got result',result);

//     else console.log('got result',error);
// }).on("data", function(log){
//     console.log('got data', log);

//     // web3.eth.getTransaction(log.transactionHash, function(err, result) {
//     //     console.log("=============err",err)
//     //     console.log("=============result",result)
//     //     // if (result.value) {
//     //     //     console.log(web3.utils.fromWei(result.value, 'ether'));
//     //     // }
//     // });
// }).on("changed", function(log){
//     console.log('changed',log);
// });
// });


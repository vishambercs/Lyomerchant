var nodemailer          = require('nodemailer');
const ejs               = require('ejs');
const fs                = require('fs');
const Web3              = require('web3');
const axios             = require('axios')
var stringify           = require('json-stringify-safe');
var cornJobs            = require('./cornJobs');
const transcationLog    = require('../Models/transcationLog');
const transactionPools  = require('../Models/transactionPool');
const clients           = require('../Models/clients');
var clientsController   = require('../controllers/clientsController');
const { constant }      = require('./Constant');
var crypto              = require("crypto");
const jwt               = require('jsonwebtoken');
const url               = require('url')
const querystring       = require('querystring');
const Constant          = require('./Constant');
const commonFunction    = require('./commonFunction');
const { generateAccount } = require('tron-create-address')
require("dotenv").config()

const transporter       = nodemailer.createTransport({ host: process.env.HOST, port: process.env.PORT, auth: { user: process.env.USER, pass: process.env.PASS, }});
var CryptoJS            = require('crypto-js')
const childProcess      = require('child_process')
const Network       = require('../Models/network');
const poolWallet    = require('../Models/poolWallet');
module.exports =
{
   async topupWebScokect(request) {
        try {
            let uniqueKey           = crypto.randomBytes(20).toString('hex')
            let url_paremeters      = url.parse(request.httpRequest.url);
            let queryvariable       = querystring.parse(url_paremeters.query)
            console.log("topupWebScokect =====================================",queryvariable);
            var hash                = CryptoJS.MD5(queryvariable.transkey + queryvariable.apikey +  process.env.BASE_WORD_FOR_HASH)
            let getTranscationData  = await commonFunction.get_Transcation_topup(queryvariable.transkey,queryvariable.apikey)
            console.log("topupWebScokect =====================================",getTranscationData);
            if(getTranscationData.length > 0)
            {
            const connection        = request.accept(null, request.origin);
            var index = Constant.topupTransList.findIndex(translist => translist.transkey == queryvariable.transkey)
            if(index == -1)
            {
            let client_object  = {  "uniqueKey": uniqueKey,  "connection": connection,  "transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}
            Constant.topupTransList.push(client_object)
            }
            else
            {
                Constant.topupTransList[index]["connection"] = connection
            }
            Constant.interval  = setInterval(commonFunction.get_data_of_topup_transcation, 10000);
            connection.on('message', function (message) {
            if(index == -1)
            {
                connection.sendUTF(JSON.stringify({ status: 200, result: true, data: {"uniqueKey": uniqueKey,"transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}, message: "Api Data" }));
            }
            })
        }
        else
        {
            return request.reject(null, request.origin);
        }
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
    async addressBalance(request) {
        try {
            let uniqueKey           = crypto.randomBytes(20).toString('hex')
            let url_paremeters      = url.parse(request.httpRequest.url);
            let queryvariable       = querystring.parse(url_paremeters.query)
            console.log("topupWebScokect =====================================",queryvariable);
            let timestamp = new Date().getTime()
            const connection        = request.accept(null, request.origin);
            var index = Constant.topupTransList.findIndex(translist => translist.transid == queryvariable.transid)
            const details             = await Network.findOne({id:queryvariable.network_id});
            const walletdetails       = await poolWallet.findOne({network_id:queryvariable.network_id ,address : queryvariable.transkey});
            if(index == -1)
            {
            let client_object  = {  
                "timestamp"         : timestamp,
                "uniqueKey"         : uniqueKey,  
                "connection"        : connection,  
                "transkey"          : queryvariable.transkey,  
                "apikey"            : queryvariable.apikey,
                "network_id"        : queryvariable.network_id,
                "amount"            : queryvariable.amount,
                "transid"           : queryvariable.transid,
              
            }
               Constant.topupTransList.push(client_object)
            }
            else
            {
                Constant.topupTransList[index]["connection"]    = connection
                Constant.topupTransList[index]["timestamp"]     = timestamp
            }

            const forked_child_process = childProcess.fork('./worker-pool.js');
            let parameters ={  "details"    : details, "walletdetails": walletdetails,"transid" : queryvariable.transid,"amount" : queryvariable.amount,"network_id" : queryvariable.network_id,"address" : queryvariable.transkey, "timestamp" :timestamp }
            forked_child_process.send(parameters);
            forked_child_process.on("message", balancedata => { 
            var index = Constant.topupTransList.findIndex(translist => translist.transkey == balancedata.address)
            if(index != -1)
            {
            const transelement =   Constant.topupTransList[index]    
            Constant.topupTransList[index].connection.sendUTF(JSON.stringify(balancedata));

            if(balancedata.status == 1 || balancedata.status == 3)
            {
                
                transelement.connection.sendUTF(JSON.stringify(balancedata));
                transelement.connection.close(1000)
                Constant.topupTransList =  Constant.topupTransList.filter(translist => translist.transid != balancedata.transid);
            }    
            }
            });

           connection.on('message', function (message) {
            console.log("Data",message)

           
           })
       
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
}
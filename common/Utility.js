var crypto                = require("crypto");
const url                 = require('url')
const querystring         = require('querystring');
const Constant            = require('./Constant');
const axios               = require('axios')
var stringify             = require('json-stringify-safe');
const topup               = require('../Models/topup');
require("dotenv").config()



var CryptoJS            = require('crypto-js')
const childProcess      = require('child_process')
const Network       = require('../Models/network');
const poolWallet    = require('../Models/poolWallet');

async function Get_RequestByAxios(URL, parameters, headers) {
    response = {}
    await axios.get(URL, {
        params: parameters,
        headers: headers
    }).then(res => {
        var stringify_response = stringify(res)
        response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
    })
        .catch(error => {
            console.error("Error", error)
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
    return response;
}


module.exports =
{
    Get_RequestByAxios:Get_RequestByAxios,
    async addressBalance(request) {
        try {
            let uniqueKey           = crypto.randomBytes(20).toString('hex')
            let url_paremeters      = url.parse(request.httpRequest.url);
            let queryvariable       = querystring.parse(url_paremeters.query)
            // console.log("topupWebScokect =====================================",queryvariable);
            let timestamp = new Date().getTime()
            const connection        = request.accept(null, request.origin);
            var index = Constant.topupTransList.findIndex(translist => translist.transid == queryvariable.transid)
            const details             = await Network.findOne({id:queryvariable.network_id});
            const walletdetails       = await poolWallet.findOne({network_id:queryvariable.network_id ,address : queryvariable.transkey});
            const forked_child_process = childProcess.fork('./worker-pool.js');
            let topitem = await topup.findOneAndUpdate({id:queryvariable.transid},{$set:{ is_check : true, comes_at : new Date().toString() }})
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
               let parameters ={  "details"    : details, "walletdetails": walletdetails,"transid" : queryvariable.transid,"amount" : queryvariable.amount,"network_id" : queryvariable.network_id,"address" : queryvariable.transkey, "timestamp" :timestamp }
               forked_child_process.send(parameters);
            }
            else
            {
                Constant.topupTransList[index]["connection"]    = connection
                Constant.topupTransList[index]["timestamp"]     = timestamp
            }
            forked_child_process.on("message", async (balancedata) => { 
            var index = Constant.topupTransList.findIndex(translist => translist.transkey == balancedata.address)
            if(index != -1)
            {
            const transelement =   Constant.topupTransList[index]    
            Constant.topupTransList[index].connection.sendUTF(JSON.stringify(balancedata));
            if(balancedata.status == 1 || balancedata.status == 3 )
            {
                transelement.connection.sendUTF(JSON.stringify(balancedata));
                transelement.connection.close(1000)
                let topitem = await topup.findOneAndUpdate({id:balancedata.transid},{$set:{ is_check : true, expire_at : new Date().toString() }})
                Constant.topupTransList =  Constant.topupTransList.filter(translist => translist.transid != balancedata.transid);
            }  
            else if (balancedata.time > 5)
            {
                // let topitem = await topup.findOneAndUpdate({id:queryvariable.transid},{$set:{
                //     is_check : true,
                //     is_check_at : new Date().toString()
                
                // }})
                
                let topitem = await topup.findOneAndUpdate({id:balancedata.transid},{$set:{ is_check : true, expire_at : new Date().toString() }})
                transelement.connection.sendUTF(JSON.stringify(balancedata));
                transelement.connection.close(1000)
                Constant.topupTransList =  Constant.topupTransList.filter(translist => translist.transid != balancedata.transid);
            }}
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
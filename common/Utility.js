const axios               = require('axios')
var stringify             = require('json-stringify-safe');
require("dotenv").config()
var CryptoJS              = require('crypto-js')
var crypto                = require("crypto");
var qs                    = require('qs');
const url                 = require('url')
const querystring         = require('querystring');
const Constant            = require('./Constant');
const Multiprocess        = require('./Multiprocess');
module.exports =
{
    
    async Post_Request_By_Axios(URL, parameters, headers) {
        let response = {}
        var config = {
            method: 'post',
            url: URL,
            data: qs.stringify(parameters),
            headers:
            {
                'Authorization': headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
           
        };
        response = await axios(config).then(function (result) {
                return JSON.stringify(result.data);
            })
            .catch(function (error) {
                // console.log(error);
                return error
            });
           
            return response;
    },

    async topupWebScokect(request) {
        try 
        {
            let uniqueKey           = crypto.randomBytes(20).toString('hex')
            let url_paremeters      = url.parse(request.httpRequest.url);
            let queryvariable       = querystring.parse(url_paremeters.query)
            const connection        = request.accept(null, request.origin);
            
            var index               = Constant.topupTransList.findIndex(translist => translist.transkey == queryvariable.transkey)
            if(index == -1)
            {
            let client_object  = {  "uniqueKey": uniqueKey,  "connection": connection,  "transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}
            Constant.topupTransList.push(client_object)
            }
            else
            {
                Constant.topupTransList[index]["connection"] = connection
            }
            connection.sendUTF(JSON.stringify({ status: 200, result: true, message:"Success", amountstatus:0, paid_in_usd:0, paid:0 }));
            let data = Multiprocess.Create_Node_Sockect_Connection(queryvariable.transkey,queryvariable.apikey)
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
}

const Utility = require('../../common/Utility');
var otpGenerator = require('otp-generator')
var mongoose = require('mongoose');
require('dotenv').config()
const fetch = require('node-fetch');
module.exports =
{
    
    async pluginallNetworks(req, res) {
        try {
            var merchantKey = req.headers.authorization
            const url      =  process.env.API_URL+"/v1/pluginallNetworks"
            let headers  =  {}
            let response =  await Utility.Post_Request_By_Axios(url,headers,merchantKey)
            console.log(response)
            var stringify_response  = JSON.parse(response)
          
            res.json(stringify_response)
         }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
 
    async assigntopupMerchantWallet(req, res) {
        try {
            var merchantKey         =  req.headers.authorization
            const url               =  process.env.API_URL+"/v1/assigntopupMerchantWallet"
            let parameters          =  {
                "networkType"       : req.body.networkType,
                "orderid"           : req.body.orderid,
                "currency"          : req.body.currency,
                "callbackurl"       : req.body.callbackurl,
                "apiredirecturl"    : req.body.apiredirecturl,
                "errorurl"          : req.body.errorurl,
                "amount"            : req.body.amount,
                "transtype"         : "topup",
            }
            let response            =  await Utility.Post_Request_By_Axios(url,parameters,merchantKey)
            var stringify_response  = JSON.parse(response)
            res.json(stringify_response)
         }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
  
    async getTranscationDataofTopup(req, res) {
        try {
            var merchantKey         =  req.headers.authorization
            const url               =  process.env.API_URL+"/v1/getTranscationDataofTopup"
            let parameters          =  
            {
                "id"       : req.body.id,
            }
            let response            =  await Utility.Post_Request_By_Axios(url,parameters,merchantKey)
            var stringify_response  = JSON.parse(response)
            res.json(stringify_response)
         }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async getTransStatus(req, res) {
        try {
            var merchantKey         =  req.headers.authorization
            const url               =  process.env.API_URL+"/v1/getTransStatus"
            let parameters          =  
            {
                "transid"       : req.body.id,
            }
            let response            =  await Utility.Post_Request_By_Axios(url,parameters,merchantKey)
            var stringify_response  = JSON.parse(response)
            res.json(stringify_response)
         }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async canceltopup(req, res) {
        try {
            var merchantKey         =  req.headers.authorization
            const url               =  process.env.API_URL+"/v1/canceltopup"
            let parameters          =  
            {
                "id"       : req.body.id,
            }
            let response            =  await Utility.Post_Request_By_Axios(url,parameters,merchantKey)
            var stringify_response  = JSON.parse(response)
            res.json(stringify_response)
         }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async hitwebhook(req, res) {
        try {
             let todo = {
                userId: 123,
                title: "loren impsum doloris",
                completed: false
            };
            
            fetch('https://webhook.site/14cbc65f-b1a6-42c2-bb38-0faeb7b4dc9d', {
                method: 'POST',
                body: JSON.stringify(todo),
                headers: { 'Content-Type': 'application/json' }
            }).then(res => console.log(res))
              .then(json => console.log(json));
            
              res.json(todo)
         }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: error })
        }
    },
    async checkbalance(req, res) {
        try {
            var merchantKey         =  ""
            const url               =  process.env.API_URL+"/v1/checkbalance"
            let parameters          =  
            {
                "id"       : req.body.id,
            }
            let response            =  await Utility.Post_Request_By_Axios(url,parameters,merchantKey)
            console.log("response",response)
            var stringify_response  = JSON.parse(response)
            res.json(stringify_response)
         }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}




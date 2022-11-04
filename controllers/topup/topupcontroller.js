
const Utility = require('../../common/Utility');
var otpGenerator = require('otp-generator')
var mongoose = require('mongoose');
require('dotenv').config()

module.exports =
{
    
    async pluginallNetworks(req, res) {
        try {
            var merchantKey = req.headers.authorization
            const url      =  "http://10.101.12.136:5003"+"/v1/pluginallNetworks"
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
}




const kycWebHookLog  = require('../Models/kycWebHookLog');
const network     = require('../Models/network');
const Utility     = require('../common/Utility');
var mongoose      = require('mongoose');
const Web3        = require('web3');
const poolWallets = require('../Models/poolWallet');
require("dotenv").config()
module.exports =
{
    async getkycWebHookLog(req, res) {
        try {
            await kycWebHookLog.find().then(async (val) => 
            {
            res.json({ status: 200, message: "Successfully", data: val })
            }).catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },


    
   
}
const kycWebHook  = require('../Models/kycWebHook');
const network     = require('../Models/network');
const Utility     = require('../common/Utility');
var mongoose      = require('mongoose');
const Web3        = require('web3');
const poolWallets = require('../Models/poolWallet');
require("dotenv").config()
module.exports =
{
    async createWebHook(req, res) {
        try {
            
            const kycWebHook = new kycWebHook({ id: mongoose.Types.ObjectId(), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
            kycWebHook.save().then(async (val) => 
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
const merchantcategories = require('../Models/merchantcategory');
const network = require('../Models/network');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
const poolWallets = require('../Models/poolWallet');
const Constant = require('../common/Constant');
const manualHotWalletTransferLogs = require('../Models/manualHotWalletTransferLogs');
require("dotenv").config()


module.exports =
{
    async createClientCategory(req, res) 
    {
        try 
        {
           const merchantcategory = new merchantcategories({
                id          : mongoose.Types.ObjectId(),
                categoryid  : req.body.categoryid,
                clientapikey: req.body.clientapikey,
                status      : 1,
                created_by  : req.body.created_by,
            });
            merchantcategory.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
            }).catch(error => { res.json({ status: 400, data: {}, message: error }) })


        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },




}
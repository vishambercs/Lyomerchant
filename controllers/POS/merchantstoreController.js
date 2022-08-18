const merchantstores = require('../../Models/merchantstore');
const Network = require('../../Models/network');
const Utility = require('../../common/Utility');
var mongoose = require('mongoose');
var crypto = require("crypto");
const TronWeb = require('tronweb')
const { generateAccount } = require('tron-create-address')
const Web3 = require('web3');
require("dotenv").config()

module.exports =
{
    async createMerchantStore(req, res) {
        try {
            var api_key = crypto.randomBytes(20).toString('hex');
            const merchantstore = new merchantstores({
                    id                      : mongoose.Types.ObjectId(),
                    clientapikey            : req.headers.authorization,
                    storename               : req.body.storename,
                    storeapikey             : api_key,
                    status                  : 0,
                    created_by              : req.headers.authorization,
                });
                merchantstore.save().then(async (val) => 
                {
                  res.json({ status: 200, message: "Successfully", data: val })
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
     async allMerchantStore(req, res) {
        try {
            await merchantstores.aggregate([
                { "$match": { "status":0 } },
                {
                $lookup: 
                {
                    from            : "clients",        // collection to join
                    localField      : "clientapikey",   //field from the input documents
                    foreignField    : "api_key",        //field from the documents of the "from" collection
                    as              : "clientDetails"   // output array field
                },
            },
            ]).then(async (data) => 
            {
                res.json({ status: 200, message: "Pool Wallet", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async MerchantStore(req, res) 
    {
        try {
            await merchantstores.aggregate([
                { "$match": { "status": 0  , "clientapikey"  : req.headers.authorization, }},
                {
                $lookup: {
                    from            : "clients", // collection to join
                    localField      : "clientapikey",//field from the input documents
                    foreignField    : "api_key",//field from the documents of the "from" collection
                    as              : "clientDetails"// output array field
                },
            },
            ]).then(async (data) => 
            {
                res.json({ status: 200, message: "Merchant Stores", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
  
 
 
}
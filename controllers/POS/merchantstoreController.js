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
            const merchantstore = new merchantstores({
                    id                      : mongoose.Types.ObjectId(),
                    clientapikey            : req.body.clientapikey,
                    storename               : req.body.storename,
                    storeapikey             : req.body.storeapikey,
                    storeqrcode             : req.body.storeqrcode,
                    status                  : 1,
                    created_by              : req.body.created_by,
                });
                merchantstore.save().then(async (val) => 
                {
                  res.json({ status: 200, message: "Successfully", data: val })
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
           
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
   

    async allMerchantStore(req, res) {
        try {
            await merchantstores.aggregate([{
                $lookup: {
                    from            : "clients", // collection to join
                    localField      : "clientapikey",//field from the input documents
                    foreignField    : "api_key",//field from the documents of the "from" collection
                    as              : "clientDetails"// output array field
                },
            },
            ]).then(async (data) => {

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
    async delete_network(req, res) {
        try {
            await Network.updateOne({ 'id': req.body.id },
            {
                $set:
                {
                    deleted_by: req.body.deleted_by,
                    deleted_at: Date.now(),
                   
                }
            }).then(async (val) => {
                if (val != null) 
                {
                    res.json({ status: 200, message: "Successfully", data: req.body.id })
                }
                else {
                    res.json({ status: 200, message: "Not Found the Data", data: null })
                }
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async change_status_network(req, res) {
        try {
            await Network.updateOne({ 'id': req.body.id },
            {
                $set:
                {
                    status: req.body.status,
                   
                }
            }).then(async (val) => {
                if (val != null) 
                {
                    const NetworkDetails = await Network.find({ 'id': req.body.id })
                    res.json({ status: 200, message: "Successfully", data: NetworkDetails })
                }
                else {
                    res.json({ status: 200, message: "Not Found the Data", data: null })
                }
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
    async changeHotWalletStatusLimit(req, res) {
        try {
            await Network.updateOne({ 'id': req.body.id },
            {
                $set:
                {
                    hotwallettranscationstatus: req.body.status,
                   
                }
            }).then(async (val) => 
            {
                if (val != null) 
                {
                    const NetworkDetails = await Network.find({ 'id': req.body.id })
                    res.json({ status: 200, message: "Successfully", data: NetworkDetails })
                }
                else {
                    res.json({ status: 200, message: "Not Found the Data", data: null })
                }
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async changeHotWalletStatusLimit(req, res) {
        try {
            await Network.updateOne({ 'id': req.body.id },
            {
                $set:
                {
                    hotwallettranscationstatus: req.body.status,
                   
                }
            }).then(async (val) => 
            {
                if (val != null) 
                {
                    const NetworkDetails = await Network.find({ 'id': req.body.id })
                    res.json({ status: 200, message: "Successfully", data: NetworkDetails })
                }
                else {
                    res.json({ status: 200, message: "Not Found the Data", data: null })
                }
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}
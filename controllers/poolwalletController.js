const poolWallet = require('../Models/poolWallet');
const network = require('../Models/network');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
var crypto = require("crypto");
const { create } = require('lodash');
require("dotenv").config()

module.exports =
{
    async create_Pool_Wallet(req, res) {
        try {
            let network_details = await network.findOne({ 'id': req.body.network_id })
            let account = await Utility.GetAddress(network_details.nodeUrl)
            const poolWalletItem = new poolWallet({ id: crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
            poolWalletItem.save().then(async (val) => 
            {
                res.json({ status: 200, message: "Successfully", data: val })
            }).
                catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async all_pool_wallet(req, res) {
        try {
            await poolWallet.aggregate([{
                $lookup: {
                    from: "networks", // collection to join
                    localField: "network_id",//field from the input documents
                    foreignField: "id",//field from the documents of the "from" collection
                    as: "walletNetwork"// output array field
                },
               
            },
            {"$project":
            {
                "privateKey": 0,
                
            }}
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
    async create_Pool_Wallet_100(req, res) {
        try {

            let network_details = await network.findOne({ 'id': req.body.network_id })
            for (let i = 0; i < 10; i++) {
                let account = await Utility.GetAddress(network_details.nodeUrl)
                const poolWalletItem = new poolWallet({ id: crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
                poolWalletItem.save().then(async (val) => {
                    console.log("val", i, val)
                    // res.json({ status: 200, message: "Successfully", data: val })
                }).catch(error => {
                    console.log("val", error)
                    // res.json({ status: 400, data: {}, message: error }) 

                })

            }
            res.json({ status: 200, message: "Successfully", data: {} })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }

    },
    async getPoolWalletWithBalance(req, res) {
        try {
            await poolWallet.aggregate([
                { $match: { balance: { $ne: "0" } } },
                {
                $lookup: {
                    from: "networks", // collection to join
                    localField: "network_id",//field from the input documents
                    foreignField: "id",//field from the documents of the "from" collection
                    as: "walletNetwork"// output array field
                },
               
            },
            {"$project":
            {
                "privateKey": 0,
                
            }}
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
    async getUsedPercentage(req, res) 
    {
        try 
        {
        
        let usedPoolWallets =  await poolWallet.aggregate( [
            { "$match": { "status": 1 } },
            { "$group": { "_id": "$network_id", "total": {"$sum":1} }   },
            { $lookup: {
                from: "networks", // collection to join
                localField: "_id",//field from the input documents
                foreignField: "id",//field from the documents of the "from" collection
                as: "walletNetwork"// output array field
            }},
           
        ])
        let freePoolWallets =  await poolWallet.aggregate( [
            { "$match": { "status": 0} },
            { "$group": { "_id": "$network_id", "total": {"$sum":1} }   },
            { $lookup: {
                from: "networks", // collection to join
                localField: "_id",//field from the input documents
                foreignField: "id",//field from the documents of the "from" collection
                as: "walletNetwork"// output array field
            }},
           
        ]) 
        let totalPoolWallets =  await poolWallet.aggregate( [
            { "$group": { "_id": "$network_id", "total": {"$sum":1} }   },
            { $lookup: {
                from: "networks", // collection to join
                localField: "_id",//field from the input documents
                foreignField: "id",//field from the documents of the "from" collection
                as: "walletNetwork"// output array field
            }},
        ]) 

        let orphanePoolWallets =  await poolWallet.aggregate( [
            { "$match": { "status": 3} },
            { "$group": { "_id": "$network_id", "total": {"$sum":1} }   },
            { $lookup: {
                from: "networks", // collection to join
                localField: "_id",//field from the input documents
                foreignField: "id",//field from the documents of the "from" collection
                as: "walletNetwork"// output array field
            }},
        ]) 
        res.json({ status: 200, data: {"orphanePoolWallets":orphanePoolWallets,"totalPoolWallets":totalPoolWallets , "usedPoolWallets" : usedPoolWallets , "freePoolWallets":freePoolWallets}, message: "Pool Wallets Statics" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_bulk_pool_wallet(req, res) {
        try {

            let network_details = await network.findOne({ 'id': req.body.network_id })
            for (let i = 0; i < req.body.total; i++) {
                let account = await Utility.GetAddress(network_details.nodeUrl)
                const poolWalletItem = new poolWallet({ created_by:req.body.created_by, id: crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
                poolWalletItem.save().then(async (val) => {
                    console.log("val", i, val)
                    // res.json({ status: 200, message: "Successfully", data: val })
                }).catch(error => {
                    console.log("val", error)
                    // res.json({ status: 400, data: {}, message: error }) 

                })
            }
            res.json({ status: 200, message: "Successfully", data: {} })
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }

    },
}
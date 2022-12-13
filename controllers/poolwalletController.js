const poolWallet = require('../Models/poolWallet');
const network = require('../Models/network');
const feedWallets = require('../Models/feedWallets');

const hotWallets = require('../Models/hotWallets');

const Utility = require('../common/Utility');
var mongoose = require('mongoose');
var crypto = require("crypto");
const { create } = require('lodash');
const { GetAddress } = require('../common/Utility');
require("dotenv").config()
const { generateAccount } = require('tron-create-address')
const Bitcoin               = require('bitcoin-address-generator');
const feedWalletController  = require('../controllers/Masters/feedWalletController');
const CryptoAccount         = require("send-crypto");
module.exports =
{
    async create_Pool_Wallet(req, res) {
        try {
            let network_details = await network.findOne({ 'id': req.body.network_id })
            let account = await Utility.GetAddress(network_details.nodeUrl)
            const poolWalletItem = new poolWallet({ id: crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
            poolWalletItem.save().then(async (val) => {
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
            {
                "$project":
                {
                    "privateKey": 0,

                }
            }
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
                {
                    "$project":
                    {
                        "privateKey": 0,

                    }
                }
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
    async getUsedPercentage(req, res) {
        try {

            let usedPoolWallets = await poolWallet.aggregate([
                { "$match": { "status": 1 } },
                { "$group": { "_id": "$network_id", "total": { "$sum": 1 } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    }
                },

            ])
            let freePoolWallets = await poolWallet.aggregate([
                { "$match": { "status": 0 } },
                { "$group": { "_id": "$network_id", "total": { "$sum": 1 } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    }
                },

            ])
            let totalPoolWallets = await poolWallet.aggregate([
                { "$group": { "_id": "$network_id", "total": { "$sum": 1 } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    }
                },
            ])

            let orphanePoolWallets = await poolWallet.aggregate([
                { "$match": { "status": 3 } },
                { "$group": { "_id": "$network_id", "total": { "$sum": 1 } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    }
                },
            ])
            res.json({ status: 200, data: { "orphanePoolWallets": orphanePoolWallets, "totalPoolWallets": totalPoolWallets, "usedPoolWallets": usedPoolWallets, "freePoolWallets": freePoolWallets }, message: "Pool Wallets Statics" })
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
                const poolWalletItem = new poolWallet({ created_by: req.body.created_by, id: crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
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
    
    async getPoolWalletID(network_id) {
        try {
        
            let network_details = await network.findOne({ 'id': network_id })
            console.log("========getPoolWalletID========",network_details) 

            // let account = await poolWallet.findOne({ network_id: network_id, status: 0 })
            let account = null
            console.log("========account========",account) 
          
            if (account == null) {
                if (network_details.libarayType == "Web3") {
                    let account = await Utility.GetAddress(network_details.nodeUrl)
                    const poolWalletItem = new poolWallet({ remarks: "Created at Run Time: " + (new Date().toString()), id: crypto.randomBytes(20).toString('hex'), network_id: network_id, address: account.address, privateKey: account.privateKey, });
                    let val = await poolWalletItem.save()
                    return val
                }
                else if (network_details.libarayType == "Tronweb") {
                    const { address, privateKey } = generateAccount()
                    console.log("========account========", address, privateKey) 
                    const poolWalletItem = new poolWallet({ remarks: "Created at Run Time: " + (new Date().toString()), id: crypto.randomBytes(20).toString('hex'), network_id: network_id, address: address, privateKey: privateKey, });
                    let val = await poolWalletItem.save()
                    return val
                }
                else if (network_details.libarayType == "btcnetwork") {
                    let URL = process.env.BTC_ADDRESS_GENERATION
                    let hotwallet = await hotWallets.findOne({network_id : network_id , status : 1})
                    URL += "action=createChild_BTC_Wallet"
                    URL += "&master_BTC_Wallet="+hotwallet.address
                    let btc_address = await Utility.Get_RequestByAxios(URL,{},{})
                    let btcaddress = JSON.parse(btc_address.data).data
                    let address    = btcaddress.errorCode == 0 ? btcaddress.data.child_BTC_WalletAddress : null
                    let val   = null
                    if(address != null)
                    { 
                    const poolWalletItem  = new poolWallet({ 
                        remarks: "Created at Run Time: " + (new Date().toString()), 
                        id: crypto.randomBytes(20).toString('hex'), 
                        network_id: network_id, 
                        address: address, 
                        privateKey: " ", });
                    val     = await poolWalletItem.save()
                    }
                    return val
                }
            }
            else 
            {
                return account
            }
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
    async generateThePoolWalletAddress(req, res) {
        try {
            let network_id = req.body.network_id;
            let network_details = await network.findOne({ 'id': req.body.network_id })
            let account = await poolWallet.findOne({ network_id: req.body.network_id, status: 0 })
            if (account == null) {
                if (network_details.libarayType == "Web3") 
                {
                    let account = await Utility.GetAddress(network_details.nodeUrl)
                    const poolWalletItem = new poolWallet({ remarks: "Created at Run Time: " + new Date().toString(), id: crypto.randomBytes(20).toString('hex'), network_id: network_id, address: account.address, privateKey: account.privateKey, });
                    let val = await poolWalletItem.save()
                    res.json({ status: 200, data: val, message: "" })
                }
                else if (network_details.libarayType == "Tronweb") {
                    const { address, privateKey } = generateAccount()
                    const poolWalletItem = new poolWallet({ remarks: "Created at Run Time: " + new Date().toString(), id: crypto.randomBytes(20).toString('hex'), network_id: network_id, address: address, privateKey: privateKey, });
                    let val = await poolWalletItem.save()
                    // return val
                    res.json({ status: 200, data: val, message: "" })
                }
                else if (network_details.libarayType == "btcnetwork") {
                    console.log(network_details.libarayType)
                    const privateKey =  CryptoAccount.newPrivateKey();
                    const address = await account.address("BTC")
                    const poolWalletItem = new poolWallet({ remarks: "Created at Run Time: " + (new Date()).toString(), id: crypto.randomBytes(20).toString('hex'), network_id: network_id, address: address, privateKey: privateKey, });
                    let val = await poolWalletItem.save()
                    res.json({ status: 200, data: val, message: "" })
                }
            }
            else {

                res.json({ status: 200, data: account, message: "" })
            }
        }
        catch (error) {
            console.log("generateThePoolWalletAddress", error)
            res.json({ status: 400, data: {}, message: error })
        }
    },
    async allwalletsWithStatus(req, res) {
        try {
            await poolWallet.aggregate([
                { $match: { status: parseInt(req.body.status) } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "network_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    },

                },
                {
                    "$project":
                    {
                        "privateKey": 0,

                    }
                }
            ]).then(async (data) => {

                res.json({ status: 200, message: "Pool Wallet", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            return null
            res.json({ status: 400, data: {}, message: error })
        }
    },
    async GetBalanceOFAddress(req, res) {
        try {

            await poolWallet.aggregate([
                { $match: { id: req.body.id } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "network_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    },

                },
                {
                    "$project":
                    {
                        "privateKey": 0,

                    }
                }
            ]).then(async (data) => {
                res.json({ status: 200, message: "Pool Wallet", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: error })
        }
    },

}
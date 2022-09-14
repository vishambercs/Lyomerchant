const clients            = require('../Models/clients');
const poolWallet         = require('../Models/poolWallet');
const transactionPools   = require('../Models/transactionPool');
const paymentlinktxpools= require('../Models/paymentLinkTransactionPool');
const transcationLog     = require('../Models/transcationLog');
const cornJobs           = require('../common/cornJobs');
var CryptoJS             = require('crypto-js')
var crypto               = require("crypto");
var Utility              = require('../common/Utility');
var commonFunction       = require('../common/commonFunction');
const bcrypt             = require('bcrypt');
const Web3               = require('web3');
var crypto               = require("crypto");
var poolwalletController = require('./poolwalletController');
require("dotenv").config()
module.exports =
{
    async assignMerchantWallet(req, res) {
        try {
            var merchantKey   = req.headers.authorization
            var networkType   = req.body.networkType
            var callbackURL   = req.body.callbackURL
            var securityHash  = req.body.securityHash
            var orderid       = req.body.orderid
            var security_hash = (merchantKey + networkType + callbackURL + process.env.BASE_WORD_FOR_HASH)
            var hash = CryptoJS.MD5(security_hash).toString();
            if (hash == securityHash) 
            {
                let currentDateTemp = Date.now();
                let currentDate = parseInt((currentDateTemp / 1000).toFixed());
                // let account = await poolWallet.findOne({ network_id: networkType, status: 0 })
                let account     = await poolwalletController.getPoolWalletID(networkType) 
                const transactionPool = new transactionPools({
                    id: crypto.randomBytes(20).toString('hex'),
                    api_key         : req.headers.authorization,
                    poolwalletID    : account.id,
                    amount          : req.body.amount,
                    currency        : req.body.currency,
                    callbackURL     : req.body.callbackURL,
                    orderid         : req.body.orderid,
                    clientToken     : req.body.token,
                    status          : 0,
                    walletValidity  : currentDate,
                    timestamps      : new Date().getTime()
                });
                transactionPool.save().then(async (val) => {
                    console.log(val)
                    await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                    let data = { transactionID: val.id, address: account.address, walletValidity: val.walletValidity }
                    res.json({ status: 200, message: "Assigned Merchant Wallet Successfully", data: data })
                }).catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })
            }
            else {
                res.json({ status: 400, data: {}, message: "Invalid Hash" })
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

    
    async getTrans(req, res) {
        try {

            await transactionPools.aggregate(
                [
                    { $match: (req.body.status == "" || req.body.status == undefined) ? { api_key: req.headers.authorization } : { api_key: req.headers.authorization, status: parseInt(req.body.status) } },
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolWallet"// output array field
                        },

                    }, {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "poolWallet.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "transcationlogs", // collection to join
                            localField: "id",//field from the input documents
                            foreignField: "trans_pool_id",//field from the documents of the "from" collection
                            as: "transactionDetails"// output array field
                        }
                    },
                    {
                        "$project": {
                            "poolWallet.privateKey": 0,
                            "poolWallet.balance": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,
                            "poolWallet.__v": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Pool Wallet1", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async get_Client_Balance(req, res) {
        try {
            await transactionPools.aggregate
                ([
                    { $match: { api_key: req.headers.authorization, status: parseInt(req.body.status) } },
                    { $lookup: { from: "poolwallets", localField: "poolwalletID", foreignField: "id", as: "poolWallet" }, },
                    { $lookup: { from: "networks", localField: "poolWallet.network_id", foreignField: "id", as: "networkDetails" } },
                    { $group: { _id: "$networkDetails.id", total: { $sum: '$amount' }, }, },
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Pool Wallet2", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async check_balance_api(req, res) {
        try {
            let addressObject = await transactionPools.aggregate(
                [

                    { $match: { $or: [{ status: 0 }, { status: 2 }] } },

                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolWallet"// output array field
                        },
                    },

                    {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "poolWallet.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project":
                        {
                            "poolWallet.privateKey": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,
                            "poolWallet.__v": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ])
            const BSC_WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject[0].networkDetails[0].nodeUrl))
           
            let account_balance = await BSC_WEB3.eth.getBalance(addressObject[0].poolWallet[0].address)
            let account_balance_in_ether = Web3.utils.fromWei(account_balance.toString(), 'ether')
            var amountstatus = commonFunction.amount_check(parseFloat(addressObject[0].poolWallet[0].balance), parseFloat(addressObject[0].amount), parseFloat(account_balance_in_ether))
            await transactionPools.findOneAndUpdate({ 'id': addressObject[0].id }, { $set: { status: amountstatus } }, { new: true }).then(async (val) => {
                let get_transcation_response = await commonFunction.Get_Transcation_List(addressObject[0].poolWallet[0].address, addressObject[0]._id)
                await poolWallet.findOneAndUpdate({ id: val.poolwalletID, status: ((amountstatus == 0 || amountstatus == 2 || amountstatus == 3) ? 0 : 1), balance: account_balance_in_ether })
                res.json({ status: 200, message: "Clients Data", data: val })
            }).catch(error => {
                console.log("get_clients_data", error)
                // return JSON.stringify({ status: 400, data: {}, message: error })
                res.json({ status: 400, data: {}, message: error })
            })

        }
        catch (error) {
            console.log(error)
            return JSON.stringify({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async get_Trans_by_Network_ID(req, res) {
        try {
            await transactionPools.aggregate(
                [
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolWallet"// output array field
                        },

                    }, {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "poolWallet.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "transcationlogs", // collection to join
                            localField: "id",//field from the input documents
                            foreignField: "trans_pool_id",//field from the documents of the "from" collection
                            as: "transactionDetails"// output array field
                        }
                    },
                    { $match: { "api_key": req.headers.authorization, "poolWallet.network_id": req.body.networkid } },
                    {
                        "$project": {
                            "poolWallet.privateKey": 0,
                            "poolWallet.balance": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,
                            "poolWallet.__v": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Pool Wallet3", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async getTransForAdmin(req, res) {
        try {
            if (req.body.status != "" && req.body.status != undefined) {
                await transactionPools.aggregate(
                    [
                        { $match: { status: parseInt(req.body.status) } },
                        {
                            $skip: parseInt(req.body.offest)
                        },
                        {
                            $limit: parseInt(req.body.limit)
                        },


                        {
                            $lookup:
                            {
                                from: "clients", // collection to join
                                localField: "api_key",//field from the input documents
                                foreignField: "api_key",//field from the documents of the "from" collection
                                as: "clientsDetails"// output array field
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "poolwallets", // collection to join
                                localField: "poolwalletID",//field from the input documents
                                foreignField: "id",//field from the documents of the "from" collection
                                as: "poolWallet"// output array field
                            },

                        }, {
                            $lookup:
                            {
                                from: "networks", // collection to join
                                localField: "poolWallet.network_id",//field from the input documents
                                foreignField: "id",//field from the documents of the "from" collection
                                as: "networkDetails"// output array field
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "transcationlogs", // collection to join
                                localField: "id",//field from the input documents
                                foreignField: "trans_pool_id",//field from the documents of the "from" collection
                                as: "transactionDetails"// output array field
                            }
                        },
                       
                        {
                            "$project": {
                                "poolWallet.privateKey": 0,
                                "poolWallet.balance": 0,
                                "poolWallet.id": 0,
                                "poolWallet._id": 0,
                                "poolWallet.status": 0,
                                "poolWallet.__v": 0,
                                "networkDetails.__v": 0,
                                "networkDetails.id": 0,
                                "networkDetails.nodeUrl": 0,
                                "networkDetails.created_by": 0,
                                "networkDetails.createdAt": 0,
                                "networkDetails.updatedAt": 0,
                                "networkDetails._id": 0
                            }
                        }
                    ]).then(async (data) => {
                        res.json({ status: 200, message: "Pool Wallet4", data: data })
                    }).catch(error => {
                        console.log("get_clients_data", error)
                        res.json({ status: 400, data: {}, message: error })
                    })
            }
            else {
                
                await transactionPools.aggregate(
                    [

                        {
                            $skip: parseInt(req.body.offest)
                        },
                        {
                            $limit: parseInt(req.body.limit)
                        },
                        {
                            $lookup:
                            {
                                from: "clients", // collection to join
                                localField: "api_key",//field from the input documents
                                foreignField: "api_key",//field from the documents of the "from" collection
                                as: "clientsDetails"// output array field
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "poolwallets", // collection to join
                                localField: "poolwalletID",//field from the input documents
                                foreignField: "id",//field from the documents of the "from" collection
                                as: "poolWallet"// output array field
                            },

                        }, {
                            $lookup:
                            {
                                from: "networks", // collection to join
                                localField: "poolWallet.network_id",//field from the input documents
                                foreignField: "id",//field from the documents of the "from" collection
                                as: "networkDetails"// output array field
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "transcationlogs", // collection to join
                                localField: "id",//field from the input documents
                                foreignField: "trans_pool_id",//field from the documents of the "from" collection
                                as: "transactionDetails"// output array field
                            }
                        },
                        {
                            "$project": {
                                "poolWallet.privateKey": 0,
                                "poolWallet.balance": 0,
                                "poolWallet.id": 0,
                                "poolWallet._id": 0,
                                "poolWallet.status": 0,
                                "poolWallet.__v": 0,
                                "networkDetails.__v": 0,
                                "networkDetails.id": 0,
                                "networkDetails.nodeUrl": 0,
                                "networkDetails.created_by": 0,
                                "networkDetails.createdAt": 0,
                                "networkDetails.updatedAt": 0,
                                "networkDetails._id": 0
                            }
                        }
                    ]).then(async (data) => {
                        res.json({ status: 200, message: "Pool Wallet5", data: data })
                    }).catch(error => {
                        console.log("get_clients_data", error)
                        res.json({ status: 400, data: {}, message: error })
                    })
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async get_Trans_by_Network_ID_For_Admin(req, res) {
        try {
            await transactionPools.aggregate(
                [
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolWallet"// output array field
                        },

                    }, {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "poolWallet.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "transcationlogs", // collection to join
                            localField: "id",//field from the input documents
                            foreignField: "trans_pool_id",//field from the documents of the "from" collection
                            as: "transactionDetails"// output array field
                        }
                    },
                    { $match: { "poolWallet.network_id": req.body.networkid } },
                    {
                        "$project": {
                            "poolWallet.privateKey": 0,
                            "poolWallet.balance": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,
                            "poolWallet.__v": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Pool Wallet6", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

    async get_Trans_by_txId(req, res) {
        try {
            console.log(req.body.id)
            await transactionPools.aggregate(
                [
                    { $match: { "id": req.body.id } },
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolWallet"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "transactionpools", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "walletValidity",//field from the documents of the "from" collection
                            as: "walletValidity"// output array field
                        }
                    },

                     {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "poolWallet.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "transcationlogs", // collection to join
                            localField: "id",//field from the input documents
                            foreignField: "trans_pool_id",//field from the documents of the "from" collection
                            as: "transactionDetails"// output array field
                        }
                    },
                    
                    
                    {
                        "$project": {
                            "poolWallet.api_key":0,
                            "poolWallet.privateKey": 0,
                            "poolWallet.poolwalletID": 0,
                            "poolWallet.orderid": 0,
                            "poolWallet.clientToken": 0,
                            "poolWallet.currency": 0,
                            "poolWallet.callbackURL": 0,
                            "poolWallet.createdAt": 0,
                            "poolWallet.updatedAt": 0,
                            "poolWallet.__v": 0,
                            "poolWallet.transactionDetails": 0,
                            "poolWallet.balance": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,                            
                            "networkDetails.__v": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "transaction details", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

    async get_Fastlink_Trans_by_txId(req, res) {
        try {
            await paymentlinktxpools.aggregate(
                [
                    { $match: { "id": req.body.id } },
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolWallet"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "transactionpools", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "walletValidity",//field from the documents of the "from" collection
                            as: "walletValidity"// output array field
                        }
                    },

                     {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "poolWallet.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "transcationlogs", // collection to join
                            localField: "id",//field from the input documents
                            foreignField: "trans_pool_id",//field from the documents of the "from" collection
                            as: "transactionDetails"// output array field
                        }
                    },
                    
                    
                    {
                        "$project": {
                            "poolWallet.api_key":0,
                            "poolWallet.privateKey": 0,
                            "poolWallet.poolwalletID": 0,
                            "poolWallet.orderid": 0,
                            "poolWallet.clientToken": 0,
                            "poolWallet.currency": 0,
                            "poolWallet.callbackURL": 0,
                            "poolWallet.createdAt": 0,
                            "poolWallet.updatedAt": 0,
                            "poolWallet.__v": 0,
                            "poolWallet.transactionDetails": 0,
                            "poolWallet.balance": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,                            
                            "networkDetails.__v": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "transaction details", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    
}
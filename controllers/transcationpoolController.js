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
const networks         = require('../Models/network');
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
                let currentDateTemp     = Date.now();
                let currentDate         = parseInt((currentDateTemp / 1000).toFixed());
                let account             = await poolwalletController.getPoolWalletID(networkType) 
                const transactionPool = new transactionPools({
                    id: crypto.randomBytes(20).toString('hex'),
                    api_key         : req.headers.authorization,
                    poolwalletID    : account.id,
                    amount          : req.body.amount,
                    currency        : req.body.currency,
                    callbackURL     : req.body.callbackURL,
                    orderid         : req.body.orderid,
                    clientToken     : req.body.token,
                    errorurl        : " ",
                    apiredirectURL  : " ",
                    status          : 0,
                    walletValidity  : currentDate,
                    timestamps      : new Date().getTime()
                });
                transactionPool.save().then(async (val) => {
                    
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
                            "api_key" : 0,
                            "poolWallet.privateKey": 0,
                            "poolWallet.balance": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,
                            "poolWallet.__v": 0,
                            "networkDetails.libarayType": 0,
                            "networkDetails.contractAddress": 0,
                            "networkDetails.contractABI": 0,
                            "networkDetails.apiKey": 0,
                            "networkDetails.transcationurl": 0,
                            "networkDetails.scanurl": 0,
                            "networkDetails.status": 0,
                            "networkDetails.gaspriceurl": 0,
                            "networkDetails.latest_block_number": 0,
                            "networkDetails.processingfee": 0,
                            "networkDetails.transferlimit": 0,
                            "networkDetails.deleted_by": 0,
                            "networkDetails.kyt_network_id": 0,
                            "networkDetails.withdrawfee": 0,
                            "networkDetails.withdrawflag": 0,
                            "networkDetails.native_currency_id": 0,
                            "networkDetails.fixedfee": 0,
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
                                "networkDetails._id": 0,
                                "clientsDetails.api_key": 0,
                                "clientsDetails.type": 0,
                                "clientsDetails.authtoken": 0,
                                "clientsDetails.token": 0,
                                "clientsDetails.secret": 0,
                                "clientsDetails.qrcode": 0,
                                "clientsDetails.emailstatus": 0,
                                "clientsDetails.loginstatus": 0,
                                "clientsDetails.emailtoken": 0,
                                "clientsDetails.status": 0,
                                "clientsDetails.two_fa": 0,
                                "clientsDetails.password": 0,
                                "clientsDetails.kycLink": 0,
                                "clientsDetails.manual_approved_by": 0,
                                "clientsDetails.manual_approved_at": 0,
                                "clientsDetails.companyname": 0,
                                "clientsDetails.deleted_by": 0,
                                "clientsDetails.deleted_at": 0
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
                            "networkDetails.apiKey": 0,
                            "networkDetails.transcationurl": 0,
                            "networkDetails.scanurl": 0,
                            "networkDetails.contractAddress": 0,
                            "networkDetails.contractABI": 0,
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
            await transactionPools.aggregate(
                [
                    { $match: { "id": req.body.id ,"api_key": req.headers.authorization } },
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
                    { $match: { "id": req.body.id, api_key : req.headers.authorization  } },
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
                            "poolWallet.privateKey": 0,
                            "poolWallet.callbackURL": 0,
                            "poolWallet.createdAt": 0,
                            "poolWallet.updatedAt": 0,
                            "poolWallet.__v": 0,
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
    async assignMerchantWalletForTopUP(req, res) {
        try {
            var merchantKey   = req.headers.authorization
            var networkType   = req.body.networkType
            var orderid       = req.body.orderid
                let currentDateTemp     = Date.now();
                let currentDate         = parseInt((currentDateTemp / 1000).toFixed());
                let account             = await poolwalletController.getPoolWalletID(networkType) 
                const transactionPool = new transactionPools({
                    id: crypto.randomBytes(20).toString('hex'),
                    api_key         : req.headers.authorization,
                    poolwalletID    : account.id,
                    amount          : req.body.amount,
                    currency        : req.body.currency,
                    callbackURL     : req.body.callbackurl,
                    apiredirectURL  : req.body.apiredirecturl,
                    errorurl        : req.body.errorurl,
                    orderid         : req.body.orderid,
                    clientToken     : " ",
                    status          : 0,
                    walletValidity  : currentDate,
                    timestamps      : new Date().getTime()
                });
                transactionPool.save().then(async (val) => {
                    await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                    let url = process.env.TOP_UP_URL+val.id
                    let data = { url:url }
                    res.json({ status: 200, message: "Assigned Merchant Wallet Successfully", data: data })
                }).catch(error => {
                    console.log("error",error)
                    res.json({ status: 400, data: {}, message: "Please Contact Admin" })
                })
            
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async getTranscationDataofTopup(req, res) {
        try {
            let transactionPool     = await transactionPools.findOne({id    : req.body.id})

            if(transactionPool == null){
               return  res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet         = await poolWallet.findOne({id  : transactionPool.poolwalletID}) 
            if(transWallet == null)
            {
                return  res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network         = await networks.findOne({ id  : transWallet.network_id}) 
            let data = 
            { 
                transactionID: transactionPool.id, 
                address: transWallet.address, 
                walletValidity: transactionPool.walletValidity,
                amount: transactionPool.amount ,
                key: transactionPool.api_key ,
                apiredirecturl     : transactionPool.apiredirectURL,
                errorurl     : transactionPool.errorurl,
                orderid     : transactionPool.orderid,
                network: network.network,
                coin: network.coin  
            }
            res.json({ status: 200, message: "Get The Data", data: data })

            
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async cancelpaymentLink(req, res) {
        try {
            let tranPool     = await transactionPools.findOne({id  : req.body.id})

            if(tranPool == null)
            {
               return  res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }

            let transactionPool = await transactionPools.findOneAndUpdate({ 'id':tranPool.id  }, { $set: { "status" : 5 , "remarks" : "By Client Canceled" , "canceled_at" : new Date().toString() }} ,{ returnDocument: 'after' })
           
           
            let data = 
            { 
                transactionID: transactionPool.id, 
                orderid     : transactionPool.orderid,
            }
            res.json({ status: 200, message: "Get The Data", data: data })

            
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
}
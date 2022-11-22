const posTransactionPools   = require('../../Models/posTransactionPool');
const poolWallet            = require('../../Models/poolWallet');
const networks              = require('../../Models/network');
const transactionPools      = require('../../Models/transactionPool');
const transcationLog        = require('../../Models/transcationLog');
const storeDevices          = require('../../Models/storeDevices');
const merchantstore         = require('../../Models/merchantstore');
const clients         = require('../../Models/clients');
const cornJobs              = require('../../common/cornJobs');
var CryptoJS                = require('crypto-js')
var crypto                  = require("crypto");
var Utility                 = require('../../common/Utility');
var commonFunction          = require('../../common/commonFunction');
var poolwalletController    = require('../poolwalletController');
const bcrypt                = require('bcrypt');
const Web3                  = require('web3');
var crypto                  = require("crypto");
require("dotenv").config()
module.exports =
{
    async assignPosMerchantWallet(req, res) {
        try {
            
            var merchantKey   = req.headers.authorization
            var networkType   = req.body.networkType
            var callbackURL   = req.body.callbackURL
            var securityHash  = req.body.securityHash
            var orderid       = req.body.orderid
            var security_hash = (merchantKey + networkType + callbackURL + process.env.BASE_WORD_FOR_HASH)
            let network_details = await networks.findOne({ 'id': networkType })
            var hash          = CryptoJS.MD5(security_hash).toString();
            let devicetoken   = req.headers.devicetoken;
            let storeDevice   = await storeDevices.findOne({ $and: [ { devicetoken: devicetoken }, { status: { $eq: 1 } }] });
            let merchantstoredata =  await merchantstore.findOne({storeapikey : merchantKey});
            if(storeDevice == null)
            {
                return res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }
            let account       = await poolwalletController.getPoolWalletID(networkType) 
            if (hash == securityHash) 
            {
                let currentDateTemp = Date.now();
                let currentDate = parseInt((currentDateTemp / 1000).toFixed());
                const posTransactionPool = new posTransactionPools({
                    id              : crypto.randomBytes(20).toString('hex'),
                    api_key         : req.headers.authorization,
                    storedetails    : merchantstoredata._id,
                    poolwalletID    : account.id,
                    clientdetail    : req.body.clientid,
                    pwid            : account._id,
                    nwid            : network_details._id,
                    amount          : req.body.amount,
                    currency        : req.body.currency,
                    callbackURL     : req.body.callbackURL,
                    orderid         : req.body.orderid,
                    clientToken     : req.body.token,
                    status          : 0,
                    deviceid        : storeDevice.deviceid,
                    walletValidity  : currentDate,
                    timestamps      : new Date().getTime()
                 
                });
                posTransactionPool.save().then(async (val) => {
                    await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                    let data = { transactionID: val.id, address: account.address, walletValidity: val.walletValidity,"transValidity":"10m" }
                    res.json({ status: 200, message: "POS Wallet Assigned Successfully", data: data })
                }).catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })
            }
            else 
            {
                res.json({ status: 400, data: {}, message: "Invalid Hash" })
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async getShopTransList(req, res) {
        try {
          
           let serachParameters = { "api_key": req.headers.authorization}
           
           if( (req.body.networkid  != "" && req.body.networkid  != undefined) && (req.body.status  != "" && req.body.status  != undefined))
           {
            serachParameters    = { "api_key": req.headers.authorization, "poolWallet.network_id": req.body.networkid, "status": parseInt(req.body.status) }
           }   
           else if(req.body.networkid  != "" && req.body.networkid  != undefined )
           {
            serachParameters    = { "api_key": req.headers.authorization, "poolWallet.network_id": req.body.networkid }
           }   
           else if(req.body.status  != "" && req.body.status  != undefined )
           {
            serachParameters    = { "api_key": req.headers.authorization,"status": parseInt(req.body.status) }
           }
            await posTransactionPools.aggregate(
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
                    {
                        $lookup: {
                            from: "merchantstores", // collection to join
                            localField: "api_key",//field from the input documents
                            foreignField: "storeapikey",//field from the documents of the "from" collection
                            as: "storeDetails"// output array field
                        }
                    },
                    {
                        $lookup: 
                        {
                            from: "clients", // collection to join
                            localField: "storeDetails.clientapikey",//field from the input documents
                            foreignField: "api_key",//field from the documents of the "from" collection
                            as: "clientDetails"// output array field
                        }
                    },
                    { $match: serachParameters },
                    {
                        "$project": 
                    {
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
                            "networkDetails.icon": 0,
                            "clientDetails.authtoken": 0,
                            "clientDetails.token": 0,
                            "clientDetails.secret": 0,
                            "clientDetails.qrcode": 0,
                            "clientDetails.hash": 0,
                            "clientDetails.emailstatus": 0,
                            "clientDetails.loginstatus": 0,
                            "clientDetails.emailtoken": 0,
                            "clientDetails.status": 0,
                            "clientDetails.two_fa": 0,
                            "clientDetails.password": 0,
                            "clientDetails.kycLink": 0,
                            "storeDetails.qrcode": 0,
                            "storeDetails.status": 0,
                            "storeDetails.created_by": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Shop Trans List", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
              
               
            
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async getTranscationDetailsByDeviceID(req, res) {
        try {
        
            let storeDevice   = await storeDevices.findOne({ $and: [ { devicetoken: req.headers.devicetoken }, { status: { $eq: 1 } }] });
            if(storeDevice == null)
            {
                return res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }
            let serachParameters = { "api_key": req.headers.authorization,"deviceid": storeDevice.deviceid}
            await posTransactionPools.aggregate(
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
                    {
                        $lookup: {
                            from: "merchantstores", // collection to join
                            localField: "api_key",//field from the input documents
                            foreignField: "storeapikey",//field from the documents of the "from" collection
                            as: "storeDetails"// output array field
                        }
                    },
                    {
                        $lookup: 
                        {
                            from: "clients", // collection to join
                            localField: "storeDetails.clientapikey",//field from the input documents
                            foreignField: "api_key",//field from the documents of the "from" collection
                            as: "clientDetails"// output array field
                        }
                    },
                    {
                        $lookup: 
                        {
                            from: "storedevices", // collection to join
                            localField: "deviceid",//field from the input documents
                            foreignField: "deviceid",//field from the documents of the "from" collection
                            as: "deviceDetails"// output array field
                        }
                    },
                    { $match: serachParameters },
                    {
                        "$project": 
                    {
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
                            "networkDetails.icon": 0,
                            "clientDetails.token": 0,
                            "clientDetails.secret": 0,
                            "clientDetails.qrcode": 0,
                            "clientDetails.hash": 0,
                            "clientDetails.emailstatus": 0,
                            "clientDetails.loginstatus": 0,
                            "clientDetails.emailtoken": 0,
                            "clientDetails.status": 0,
                            "clientDetails.two_fa": 0,
                            "clientDetails.password": 0,
                            "clientDetails.authtoken": 0,
                            "clientDetails.kycLink": 0,
                            "storeDetails.qrcode": 0,
                            "storeDetails.status": 0,
                            "storeDetails.created_by": 0,
                            "networkDetails._id": 0


                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Shop Trans List", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
              
               
            
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async getTranscationDetailsByStoreID(req, res) {
        try {
        
            let serachParameters = { "storeDetails.storeapikey": req.headers.authorization}
            await posTransactionPools.aggregate(
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
                    {
                        $lookup: {
                            from: "merchantstores", // collection to join
                            localField: "api_key",//field from the input documents
                            foreignField: "storeapikey",//field from the documents of the "from" collection
                            as: "storeDetails"// output array field
                        }
                    },
                    {
                        $lookup: 
                        {
                            from: "clients", // collection to join
                            localField: "storeDetails.clientapikey",//field from the input documents
                            foreignField: "api_key",//field from the documents of the "from" collection
                            as: "clientDetails"// output array field
                        }
                    },
                    {
                        $lookup: 
                        {
                            from: "storedevices", // collection to join
                            localField: "deviceid",//field from the input documents
                            foreignField: "deviceid",//field from the documents of the "from" collection
                            as: "deviceDetails"// output array field
                        }
                    },
                    { $match: serachParameters },
                    {
                        "$project": 
                    {
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
                            "networkDetails.icon": 0,
                            "clientDetails.authtoken": 0,
                            "clientDetails.token": 0,
                            "clientDetails.secret": 0,
                            "clientDetails.qrcode": 0,
                            "clientDetails.hash": 0,
                            "clientDetails.emailstatus": 0,
                            "clientDetails.loginstatus": 0,
                            "clientDetails.emailtoken": 0,
                            "clientDetails.status": 0,
                            "clientDetails.two_fa": 0,
                            "clientDetails.password": 0,
                            "clientDetails.authtoken": 0,
                            "clientDetails.kycLink": 0,
                            "storeDetails.qrcode": 0,
                            "storeDetails.status": 0,
                            "storeDetails.created_by": 0,
                            "networkDetails._id": 0


                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Shop Trans List", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
              
               
            
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

    
}
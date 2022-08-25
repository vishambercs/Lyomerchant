const posTransactionPool = require('../Models/posTransactionPool');
const transactionPool = require('../Models/transactionPool');
const poolWallet = require('../Models/poolWallet');
const hotWallets = require('../Models/hotWallets');
var mongoose = require('mongoose');
var crypto = require("crypto");
const TronWeb = require('tronweb')
const { generateAccount } = require('tron-create-address')
const Web3 = require('web3');
require("dotenv").config()

module.exports =
{
    async orphanTranscation(req, res) {
        try {
            let transactionPoolData = await transactionPool.aggregate([
                {
                    $lookup: {
                        from: "poolwallets",
                        localField: "poolwalletID",
                        foreignField: "id",
                        as: "poolwalletDetails"
                    }
                },
                {
                    $lookup: {
                        from: "clients",
                        localField: "api_key",
                        foreignField: "api_key",
                        as: "clientDetails"
                    }
                },
                {
                    $lookup: 
                    {
                        from: "networks",
                        localField: "poolwalletDetails.network_id",
                        foreignField: "id",
                        as: "networkDetails"
                    }
                },
                { $match: { "status": 4 } },
                {
                    "$project": {
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
                        "poolwalletDetails._id": 0,
                        "poolwalletDetails.status": 0,
                        "poolwalletDetails.__v": 0,
                        "poolwalletDetails.privateKey": 0,
                        "networkDetails.__v": 0,
                        "networkDetails.nodeUrl": 0,
                        "networkDetails.created_by": 0,
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
                        "networkDetails.createdAt": 0,
                        "networkDetails.updatedAt": 0,
                        "networkDetails._id": 0
                        
                    }
                }
            ])
            let posTransactionPoolData = await posTransactionPool.aggregate([
                {
                    $lookup: {
                        from: "poolwallets",
                        localField: "poolwalletID",
                        foreignField: "id",
                        as: "poolwalletDetails"
                    }
                },
                {
                    $lookup: {
                        from: "merchantstores",
                        localField: "api_key",
                        foreignField: "storeapikey",
                        as: "storesDetails"
                    }
                },
                {
                    $lookup: {
                        from: "clients",
                        localField: "storesDetails.clientapikey",
                        foreignField: "api_key",
                        as: "clientDetails"
                    }
                },
                {
                    $lookup: 
                    {
                        from: "networks",
                        localField: "poolwalletDetails.network_id",
                        foreignField: "id",
                        as: "networkDetails"
                    }
                },
                { $match: { "status": 4 } },
                {
                    "$project": {
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
                        "poolwalletDetails._id": 0,
                        "poolwalletDetails.status": 0,
                        "poolwalletDetails.__v": 0,
                        "poolwalletDetails.privateKey": 0,
                        "networkDetails.__v": 0,
                        "networkDetails.nodeUrl": 0,
                        "networkDetails.created_by": 0,
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
                        "storesDetails.qrcode": 0,
                        "storesDetails.status": 0,
                        "storesDetails.created_by": 0,
                        "storesDetails.deleted_by": 0,
                        "networkDetails.updatedAt": 0,
                        "networkDetails.updatedAt": 0,
                        "networkDetails._id": 0
                        
                    }
                }
            ])
            res.json({ status: 200, message: "Orphan Pool Wallets", data:  { "transactionPool": transactionPoolData, "posTransactionPool" :posTransactionPoolData }})
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

}
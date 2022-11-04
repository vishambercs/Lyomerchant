const posTransactionPool         = require('../Models/posTransactionPool');
const transactionPool            = require('../Models/transactionPool');
const pyLinkTransPool            = require('../Models/paymentLinkTransactionPool');
const poolWallet                 = require('../Models/poolWallet');
const networks                   = require('../Models/network');
const hotWallets                 = require('../Models/hotWallets');
const orphanwalletlog            = require('../Models/orphanwalletlogs');
const transferUtility            = require('../common/transferUtility');
var mongoose                     = require('mongoose');
var crypto                       = require("crypto");
const TronWeb                    = require('tronweb')
const { generateAccount }        = require('tron-create-address')
const Web3                       = require('web3');
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
                        "clientDetails.authtoken": 0,
                        "clientDetails.password": 0,
                        "clientDetails.emailtoken": 0,
                        "clientDetails.status": 0,
                        "clientDetails.two_fa": 0,
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
            let pyLinkTransPools = await pyLinkTransPool.aggregate([
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
                    $lookup: {
                        from            : "paylinkpayments",
                        localField      : "payLinkId",
                        foreignField    : "id",
                        as: "paylinkDetails"
                    }
                },
                {
                    $lookup: {
                        from            : "paylinkpayments",
                        localField      : "payLinkId",
                        foreignField    : "id",
                        as: "paylinkDetails"
                    }
                },
                {
                    $lookup: 
                    {
                        from: "invoices",
                        localField: "paylinkDetails.invoice_id",
                        foreignField: "id",
                        as: "invoicesDetails"
                    }
                },
                { $match: { "status": 4 } },
                {
                    "$project": {
                        "clientDetails.token"  : 0,
                        "clientDetails.secret" : 0,
                        "clientDetails.qrcode" : 0,
                        "clientDetails.hash"   : 0,
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
                        "networkDetails.updatedAt": 0,
                        "networkDetails.updatedAt": 0,
                        "networkDetails._id": 0
                    }
                }
            ])
            res.json({ status: 200, message: "Orphan Pool Wallets", data:  { 
                
                "transactionPool"       : transactionPoolData, 
                "posTransactionPool"    : posTransactionPoolData,
                "pyLinkTransPool"       : pyLinkTransPools
            }})
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async checkBalanceorphanWallet(req, res) {
        try 
        {
            let transpool          = await transactionPool.findOne({ id : req.body.transid ,     "status": 4   })
            let postranspool       = await posTransactionPool.findOne({ id : req.body.transid,   "status": 4  })
            let pylinkTransPool    = await pyLinkTransPool.findOne({ id:req.body.transid  ,    "status": 4   })
            
            let poolwalletid       = transpool != null ? transpool.poolwalletID : null
            poolwalletid           = postranspool != null ? postranspool.poolwalletID : poolwalletid
            poolwalletid           = pylinkTransPool != null ? pylinkTransPool.poolwalletID : poolwalletid
            
            if(poolwalletid == null)
            {
             return  res.json({ status: 400, data: null, message: "Invalid Trans ID" })
            }
   
            let poolwl             =  await poolWallet.findOne({ id:poolwalletid })
            
            if(poolwl == null)
            {
             return  res.json({ status: 400, data: null, message: "Invalid Request" })
            }
            
            let network                =  await networks.findOne({ id:poolwl.network_id })
            let balnace                =  await transferUtility.CheckBalanceOfAddress(network.nodeUrl,network.libarayType,poolwl.address,network.contractAddress,poolwl.privateKey,)
            let response               =  balnace.data
            response["coin"]           =  network.coin
            response["network"]        =  network.network
            let statusresponse         =  balnace.status == 200 ? 200 : 400
            let messageresponse        =  balnace.status == 200 ?  "Success" :  "Error"
            res.json({ status: statusresponse, data: response, message: messageresponse })
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async save_orphan_wallet(req, res) {
        try 
        {   
         
         let adminstatus        = req.body.status   
         let transpool          = await transactionPool.findOne({ id:req.body.transid ,     "status": 4   })
         let postranspool       = await posTransactionPool.findOne({ id:req.body.transid,   "status": 4  })
         let pylinkTransPool    = await pyLinkTransPool.findOne({ id:req.body.transid  ,    "status": 4   })
      
         let poolwalletid       = transpool != null ? transpool.poolwalletID                : null
         poolwalletid           = postranspool != null ? postranspool.poolwalletID          : poolwalletid
         poolwalletid           = pylinkTransPool != null ? pylinkTransPool.poolwalletID    : poolwalletid
         
         let clientapikey       = transpool != null       ? transpool.api_key                     : 0
         clientapikey           = postranspool != null    ? postranspool.api_key             : clientapikey
         clientapikey           = pylinkTransPool != null ? pylinkTransPool.api_key          : clientapikey



         if(poolwalletid == null)
         {
          return  res.json({ status: 400, data: null, message: "Invalid Trans ID" })
         }
         
         let poolwl             =  await poolWallet.findOne({ id:poolwalletid,status:3 })
         
         if(poolwl == null)
         {
          return  res.json({ status: 400, data: null, message: "Invalid Request" })
         }
         let network                =  await networks.findOne({ id:poolwl.network_id })
         let balnace                =  await transferUtility.CheckBalanceOfAddress(network.nodeUrl,network.libarayType,poolwl.address,network.contractAddress,poolwl.privateKey)
         
         if(balnace.status == 200 && balnace.data.format_token_balance > 0 && adminstatus == 1  )
         {
            await orphanwalletlog.insertMany([{
                id : mongoose.Types.ObjectId(),
                trans_id:req.body.transid, 
                remarks: "Tried to free the wallet", 
                created_by : req.headers.authorization,
                created_at : new Date().toString()  }])
            return  res.json({ status: 400, data: null, message: "You can not free the wallet" })
         }

         if(balnace.status == 200 && balnace.data.token_balance == 0 && adminstatus == 1  )
         {
            let poolwl =  await poolWallet.findOneAndUpdate({ id : poolwalletid } , { $set: { status : 0 , balance : 0 } },{returnDocument: 'after'})
            await orphanwalletlog.insertMany([{
                id : mongoose.Types.ObjectId(),
                trans_id:req.body.transid, 
                remarks: "Free the wallet", 
                created_by : req.headers.authorization,
                created_at : new Date().toString()  }])
            return  res.json({ status: 200, data: poolwl, message: "Pool Wallet become free" })
         }

         if(balnace.status == 200 && balnace.data.format_token_balance > 0 && adminstatus == 2  )
         {
            let hotWallet               =  await hotWallets.findOne({ "network_id": network.id, "status": 1 })
            let GasFee                  =  await transferUtility.calculateGasFee(network.nodeUrl,network.libarayType,poolwl.address,hotWallet.address,balnace.data.token_balance,network.contractAddress)
            let balanceTransfer         =  network.libarayType == "Web3" ? balnace.data.format_native_balance : balnace.data.token_balance 
            let hot_wallet_transcation  =  await transferUtility.transfer_amount_to_hot_wallet(poolwl.id, req.body.transid, balanceTransfer, balnace.data.native_balance,GasFee.data.fee)
            let clientWallet            =  await transferUtility.updateClientWallet(clientapikey, network.id, balnace.data.format_token_balance)
            await orphanwalletlog.insertMany(
            [{
                id : mongoose.Types.ObjectId(),
                trans_id:req.body.transid, 
                remarks: "Saved For Hot Wallet Transfer", 
                created_by : req.headers.authorization,
                created_at : new Date().toString()  
            }])
            return  res.json({ status: 200, data: poolwl, message: "Transcation Successfully added for transfering from the pool wallet to hot wallet. " })
         }

         res.json({ status: 200, data: balnace, message: "Success" })
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },


}
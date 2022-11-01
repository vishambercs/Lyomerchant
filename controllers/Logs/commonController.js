const paymentLinkTransactionPool = require('../../Models/paymentLinkTransactionPool');
const posTransactionPool = require('../../Models/posTransactionPool');
const network = require('../../Models/network');
const poolWallets = require('../../Models/poolWallet');
const transactionPool = require('../../Models/transactionPool');
const payLink = require('../../Models/payLink');

const invoice = require('../../Models/invoice');

const Constant = require('../../common/Constant');
const { getBalance } = require('bitcoin-core/src/methods');
const Web3 = require('web3');
const { concat } = require('lodash');
require("dotenv").config()



module.exports =
{

    async getTransStatus(req, res) {
        try {
            let id = req.body.transid;
            let pyTranPool = await paymentLinkTransactionPool.findOne({ "id": id, "api_key": req.headers.authorization })
            let posTranPool = await posTransactionPool.findOne({ "id": id, "api_key": req.headers.authorization })
            let TranPool = await transactionPool.findOne({ "id": id, "api_key": req.headers.authorization })
            
            let poolwallet = pyTranPool != null ? await poolWallets.findOne({ id: pyTranPool.poolwalletID }) : null
            poolwallet = (poolwallet == null && posTranPool != null) ? await poolWallets.findOne({ id: posTranPool.poolwalletID }) : poolwallet
            poolwallet = (poolwallet == null && TranPool != null) ? await poolWallets.findOne({ id: TranPool.poolwalletID }) : poolwallet

            let payLink_data = pyTranPool != null ? await payLink.findOne({ id: pyTranPool.payLinkId}) : null
            let invoice_data = payLink_data != null ? await invoice.findOne({ id: payLink_data.invoice_id}) : null

            let networkDetails = poolwallet != null ? await network.findOne({ id: poolwallet.network_id}) : null
            let status = pyTranPool != null ? Constant.transstatus.filter(index => index.id == pyTranPool.status) : []
            status = (status.length > 0 && posTranPool != null) ? Constant.transstatus.filter(index => index.id == posTranPool.status) : status
            status = (status.length > 0 && TranPool != null) ? Constant.transstatus.filter(index => index.id == TranPool.status) : status
            
            
            let amount = pyTranPool != null                   ? pyTranPool.amount : 0
            amount     = (amount == 0 && posTranPool != null) ?  posTranPool.amount : amount
            amount     = (amount == 0 && TranPool != null)    ? TranPool.amount : amount
            
            let currency = pyTranPool != null                   ? pyTranPool.currency : 0
            currency     = (amount == 0 && posTranPool != null) ?  posTranPool.currency : currency
            currency     = (amount == 0 && TranPool != null)    ? TranPool.currency : currency

            
            // let invoiceNumber = pyTranPool != null ? pyTranPool.invoiceNumber : ""

            let datarray = 
            {
                "transaction_status"    : (status.length > 0 ? status[0].title : ""),
                "transaction_id"        : req.body.transid,
                "address"               : (poolwallet != null ? poolwallet.address : ""),
                "coin"                  : (networkDetails != null ? networkDetails.coin : ""),
                "network"               : (networkDetails != null ? networkDetails.network : ""),
                "crypto_amount"         :  amount,
                "invoicenumber"         :  (invoice_data != null ) ? invoice_data.invoiceNumber : "" ,
                "fiat_amount"           :  (invoice_data != null ) ? invoice_data.totalAmount : "" ,
                "currency"              : currency   
                
            }

            res.json(
                {
                    status: 200,
                    data: datarray,
                    "message": (status.length > 0 ? "" : "transaction Not Found")
                })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },

    async getBalance(req, res) {
        try {
            const WEB3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"))
            const contract = new WEB3.eth.Contract(Constant.USDT_ABI, "0xF5EB513a31af1Af797E3514a713cCc11492FB2df");
            let token_balance = await contract.methods.balanceOf(req.body.address.toLowerCase()).call();
            let native_balance = await WEB3.eth.getBalance(req.body.address.toLowerCase())
           
            res.json(
                {
                    status: 200,
                    token_balance: token_balance,
                    native_balance: native_balance
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },

    async getAllTranscation(req, res) {
        try {
            let filter = {}
            let index = -1
            let type = ""
            let transtype = ["POS","Website","Paylink"]

            if(Object.keys(req.body).indexOf("fromdate")!= -1){
                var  fromdate   = req.body.fromdate
                var  fromdated  = new Date (fromdate)
                filter["createdAt"] =    { $gte: fromdated }  
            }

            if(Object.keys(req.body).indexOf("todate") != -1){
                var  fromdate = Object.keys(req.body).indexOf("fromdate") != -1 ? req.body.fromdate : null
                var  todate         = req.body.todate
                var  todateed       = new Date (todate)
                todateed.setDate(todateed.getDate() + 1);           
                
                var inputtodateed = new Date(todateed.toISOString());
                var  fromdated      = new Date (fromdate)
                var inputfromdated = new Date(fromdated.toISOString());
                let dateRange       = fromdate != null ? { $gte:inputfromdated , $lte:inputtodateed}   : { $lte: inputtodateed }  
                filter["createdAt"] = dateRange 
            }
            if(Object.keys(req.body).indexOf("clientapikey") != -1){
                filter["api_key"] = req.body.clientapikey 
            }
          
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
                { 
                   
                    $match: filter,
                  
                },
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
                },
                { $sort : { createdAt : 1 } }
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
                        foreignField: "clientapikey",
                        as: "storesDetails"
                    }
                },
                {
                    $lookup: {
                        from: "storedevices",
                        localField: "storesDetails.storeapikey",
                        foreignField: "storekey",
                        as: "deviceDetails"
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
                { 
                   
                    $match: filter,
                  
                },
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
                },
                { $sort : { createdAt : 1 } }
            ])
            let pyLinkTransPools = await payLink.aggregate([
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
                { 
                   
                    $match: filter,
                  
                },
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
                },
                { $sort : { createdAt : 1 } }
            ])
            

            if(Object.keys(req.body).indexOf("transtype") != -1)
            {
                 index = transtype.indexOf(req.body.transtype)
                 type  = index != -1 ? transtype[index] : type
            }

            res.json({ status: 200, message: "All Transcation", data:  { 
                
                "transactionPool"       : (type == "" || type == "Website" )    ? transactionPoolData  : [], 
                "posTransactionPool"    : (type == "" || type == "POS" )        ? posTransactionPoolData   : [], 
                "pyLinkTransPool"       : (type == "" || type == "Paylink" )    ? pyLinkTransPools     : [], 
            }})
        }
        catch (error) {
            console.log("error",error)
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
    async getAllTranscationOfMerchant(req, res) {
        try {

            let filter = {}
            let index = -1
            let type = ""
            let transtype = ["POS","Website","Paylink"]

            if(Object.keys(req.body).indexOf("fromdate")!= -1){
                var  fromdate   = req.body.fromdate
                var  fromdated  = new Date (fromdate)
                filter["createdAt"] =    { $gte: fromdated }  
            }

            if(Object.keys(req.body).indexOf("todate") != -1){
                var  fromdate       = Object.keys(req.body).indexOf("fromdate") != -1 ? req.body.fromdate : null
                var  todate         = req.body.todate
                var  todateed       = new Date (todate)
                todateed.setDate(todateed.getDate() + 1);           
                
                var inputtodateed   = new Date(todateed.toISOString());
                var  fromdated      = new Date (fromdate)
                var inputfromdated  = new Date(fromdated.toISOString());
                let dateRange       = fromdate != null ? { $gte:inputfromdated , $lte:inputtodateed}   : { $lte: inputtodateed }  
                filter["createdAt"] = dateRange 
            }
            if(Object.keys(req.body).indexOf("clientapikey") != -1){
                filter["api_key"]   = req.body.clientapikey 
            }
          
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
                { $match: { "api_key": req.headers.authorization } },
                {
                    "$project": {
                        "callbackURL" : 0,
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
                        "poolwalletDetails._id": 0,
                        "poolwalletDetails.status": 0,
                        "poolwalletDetails.__v": 0,
                        "poolwalletDetails.privateKey": 0,
                        "networkDetails.__v": 0,
                        "networkDetails.nodeUrl": 0,
                        "networkDetails.withdrawflag": 0,
                        "networkDetails.withdrawfee": 0,
                        "networkDetails.fixedfee": 0,
                        "networkDetails.native_currency_id": 0,
                        "networkDetails.kyt_network_id": 0,
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
                { $match: { "api_key": req.headers.authorization } },
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
                        "networkDetails.withdrawflag": 0,
                        "networkDetails.withdrawfee": 0,
                        "networkDetails.fixedfee": 0,
                        "networkDetails.native_currency_id": 0,
                        "networkDetails.kyt_network_id": 0,
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

            let pyLinkTransPools = await paymentLinkTransactionPool.aggregate([
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
                        as              : "paylinkDetails"
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
                {
                    $lookup: 
                    {
                        from: "fastpaymentcodes",
                        localField: "payLinkId",
                        foreignField: "id",
                        as: "fastpaymentdetails"
                    }
                },
                { 
                    $match: filter,
                },
                {
                    "$project": {
                        
                        "clientDetails.token"                   : 0,
                        "clientDetails.secret"                  : 0,
                        "clientDetails.qrcode"                  : 0,
                        "clientDetails.hash"                    : 0,
                        "clientDetails.emailstatus"             : 0,
                        "clientDetails.loginstatus"             : 0,
                        "clientDetails.emailtoken"              : 0,
                        "clientDetails.authtoken"               : 0,
                        "clientDetails.updatedAt"               : 0,
                        "clientDetails.status"                  : 0,
                        "clientDetails.two_fa"                  : 0,
                        "clientDetails.password"                : 0,
                        "clientDetails.kycLink"                 : 0,
                        "poolwalletDetails._id"                 : 0,
                        "poolwalletDetails.status"              : 0,
                        "poolwalletDetails.__v"                 : 0,
                        "poolwalletDetails.privateKey"          : 0,
                        "networkDetails.__v"                    : 0,
                         "networkDetails.nodeUrl"               : 0,
                         "networkDetails.withdrawflag"          : 0,
                         "networkDetails.withdrawfee"           : 0,
                         "networkDetails.fixedfee"              : 0,
                         "networkDetails.native_currency_id"    : 0,
                         "networkDetails.kyt_network_id"        : 0,
                         "networkDetails.created_by"            : 0,
                         "networkDetails.libarayType"           : 0,
                         "networkDetails.contractAddress"           : 0,
                         "networkDetails.contractABI"               : 0,
                         "networkDetails.apiKey"                    : 0,
                         "networkDetails.transcationurl"            : 0,
                         "networkDetails.scanurl"                   : 0,
                         "networkDetails.status"                    : 0,
                         "networkDetails.gaspriceurl"               : 0,
                         "networkDetails.latest_block_number"       : 0,
                         "networkDetails.processingfee"             : 0,
                         "networkDetails.transferlimit"             : 0,
                         "networkDetails.deleted_by"                : 0,
                         "networkDetails.updatedAt"                 : 0,
                         "networkDetails.updatedAt"                 : 0,
                         "networkDetails.hotwallettranscationstatus": 0,
                         "networkDetails._id": 0
                    }
                }
            ])
            
            res.json({ status: 200, message: "All Transcation", data:  { 
                
                "transactionPool"       : transactionPoolData, 
                "posTransactionPool"    : posTransactionPoolData,
                "pyLinkTransPool"       : pyLinkTransPools
            }})
        }
        catch (error) {
            console.log("error",error)
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
}
const topup               = require('../../Models/topup');
const networks            = require('../../Models/network');
const admin               = require('../../Models/admin');
const webHookCall         = require('../../Models/webHookCall');
var otpGenerator          = require('otp-generator')
var mongoose              = require('mongoose');
const clients             = require('../../Models/clients');
const poolWallet          = require('../../Models/poolWallet');
var poolwalletController  = require('../poolwalletController');
var adminBalanceUpdate    = require('../../common/adminBalanceUpdate');
var crypto                = require("crypto");
module.exports =
{
    
    async create_top_payment(req, res) {
        try {
            var merchantKey = req.headers.authorization
            var networkType = req.body.networkType
            var orderid = req.body.orderid
            let currentDateTemp = Date.now();
            let currentDate = parseInt((currentDateTemp / 1000).toFixed());
            let account = await poolwalletController.getPoolWalletID(networkType)
            let network_details = await networks.findOne({ 'id': networkType })
            let client = await clients.findOne({ 'api_key': req.headers.authorization })
            let amount = Object.keys(req.body).indexOf("amount") == -1 ?  0 : parseFloat(req.body.amount)
            const transactionPool = new topup({
                id             : mongoose.Types.ObjectId(),
                pwid           : account._id,
                nwid           : network_details._id,
                clientdetail   : client._id,
                api_key        : req.headers.authorization,
                poolwalletID   : account.id,
                amount         : amount,
                currency       : req.body.currency,
                callbackURL    : req.body.callbackurl,
                apiredirectURL : req.body.apiredirecturl,
                errorurl       : req.body.errorurl,
                orderid        : req.body.orderid,
                status         : 0,
                walletValidity : currentDate,
                transtype      : amount > 0 ? 2 : 1,
                remarks        : req.body.remarks,
                timestamps     : new Date().getTime()
            });
            transactionPool.save().then(async (val) => {
                await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                let url = process.env.TOP_UP_URL + val.id
                let data = { url: url }
                res.json({ status: 200, message: "Assigned Merchant Wallet Successfully", data: data })
            }).catch(error => {
                console.log("error", error)
                res.json({ status: 400, data: {}, message: "Please Contact Admin" })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async change_the_topuptimespent(req, res) {
        try {

            let currentDateTemp = Date.now();
            let currentDate     = parseInt((currentDateTemp / 1000).toFixed());
            let topupdata       = await topup.findOneAndUpdate({ id : req.body.id} , 
                { $set : { 
                  admin_updated    : req.headers.authorization,
                  admin_updatedat  : new Date().toString(),
                  walletValidity   : currentDate,  timestamps     : new Date().getTime() }} , {returnDocument : 'after'})     
            
            if(topupdata == null)
            {
                return res.json({ status: 400, data: {}, message: "Invalid Trans ID" })
            }

            res.json({ status: 200, data: {id : topupdata.id} , message: "Updated Successfully" })
            
            
            
            
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async get_top_payment_data(req, res) {
        try {
            let transactionPool = await topup.findOne({ id: req.body.id , status : 0 })
            console.log("transactionPool",transactionPool)
            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })
            console.log("transWallet",transWallet)
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network = await networks.findOne({ id: transWallet.network_id })
            let data =
            {
                transactionID   : transactionPool.id,
                address         : transWallet.address,
                walletValidity  : transactionPool.walletValidity,
                amount          : transactionPool.amount,
                key             : transactionPool.api_key,
                apiredirecturl  : transactionPool.apiredirectURL,
                errorurl        : transactionPool.errorurl,
                orderid         : transactionPool.orderid,
                network         : network.network,
                coin            : network.coin
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
            let tranPool     = await topup.findOne({id  : req.body.id })
            if(tranPool == null)
            {
               return  res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transactionPool = await topup.findOneAndUpdate({ 'id':tranPool.id  }, { $set: { "status" : 5 , "remarks" : "By Client Canceled" , "canceled_at" : new Date().toString() }} ,{ returnDocument: 'after' })
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
    async get_the_webhook(req, res) {
        try {
            let transactionPool = await webHookCall.findOne({ trans_id: req.body.id, })
            if (transactionPool == null) 
            {
                return res.json({ status: 400, data: {}, message: "WebHook is not called" })
            }
            res.json({ status: 200, message: "Get The Webhook", data: transactionPool })
        }
        catch (error) {
            console.log("get_the_webhook", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async call_the_webhook(req, res) {
        try {
        
            let transactionPool  = await topup.findOne({ id: req.body.id})
            let admindata        = await admin.findOne({ admin_api_key : req.headers.authorization})
            console.log("admindata._id",admindata._id)
            let previousCallpool = await webHookCall.findOne({ trans_id: req.body.id, })
            if (transactionPool == null) 
            {
                return res.json({ status: 400, data: {}, message: "Invalid Trans ID" })
            }

            if (admindata == null) 
            {
                return res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }

            // if (previousCallpool != null) 
            // {
            //     return res.json({ status: 400, data: {}, message: "Webhook is Already Called" })
            // }
            let topup_verify = await adminBalanceUpdate.SendWebHookResponse(transactionPool.id,admindata._id)
            if (topup_verify.status == 400) 
            {
                return res.json({ status: 400, message: "Please Contact Admin", data: {} })
            }
            let webHookCallpool = await webHookCall.find({ trans_id: req.body.id, })
            if (webHookCallpool == null) 
            {
                return res.json({ status: 400, message: "Please Contact Admin", data: {} })
            }
            res.json({ status: 200, message: "Get The Webhook", data: webHookCallpool })
        }
        catch (error) {
            console.log("get_the_webhook", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async change_topup_network(req, res) {
        try {
            
            var networkType = req.body.networkType

            let transpool = await topup.findOne({ 'id': req.body.id })

            if(transpool == null)
            {
                return  res.json({ status: 400, data: {}, message: "Invalid Trans ID" })
            }

            let network_details = await networks.findOne({ 'id': networkType })

            let admins = await admin.findOne({ 'admin_api_key': req.headers.authorization })

            if(network_details == null)
            {
                return  res.json({ status: 400, data: {}, message: "Invalid Network ID" })
            }

            let poolWalletDetails = await poolWallet.findOne({id : transpool.poolwalletID})

            if(poolWalletDetails == null)
            {
                return  res.json({ status: 400, data: {}, message: "Invalid Trans ID" })
            }
            const poolWalletItem = new poolWallet({ 
                remarks     : "Created at Run Time: " + (new Date().toString())+ "because client paid on different network.", 
                id          : crypto.randomBytes(20).toString('hex'), 
                network_id  : network_details.id, 
                address     : poolWalletDetails.address, 
                status      : 1, 
                privateKey  : poolWalletDetails.privateKey });
            
            let val = await poolWalletItem.save()
            let transPoolNetwork = await topup.findOneAndUpdate({ 'id': req.body.id },
            { $set : {
            "poolwalletID"                  : val.id,
            "pwid"                          : val._id,
            "nwid"                          : network_details._id,
            "manaual_network_by_admin"      : admins._id,
            "manaual_network_at_by_admin"   : new Date().toString()
            }}, {'returnDocument' : 'after'})


            res.json({ status: 200, data: transPoolNetwork, message: "success" })
           
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}




const topup = require('../../Models/topup');
const poolWallet = require('../../Models/poolWallet');
const networks = require('../../Models/network');
var otpGenerator = require('otp-generator')
var mongoose = require('mongoose');
const clients = require('../../Models/clients');
var poolwalletController = require('../poolwalletController');
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
}




const invoice = require('../../Models/invoice');
const paylinkPayment = require('../../Models/payLink');
const transaction = require("../transcationpoolController")
const fastPaymentCode = require('../../Models/fastPaymentCode');
const merchantStore = require('../../Models/merchantstore');
const paymentLinkTransactionPool = require('../../Models/paymentLinkTransactionPool');
const poolWallet = require('../../Models/poolWallet');
var crypto = require("crypto");
var mongoose = require('mongoose');
var CryptoJS = require('crypto-js')
var poolwalletController = require('../poolwalletController');
let message = ''
let status = ''
const jwt = require('jsonwebtoken');

async function storeInvoice(invoiceNumber,merchantKey,Items,customerName,email,mobileNumber,duedate,additionalNotes,payment_reason,currency,totalAmount,orderId,callbackURL,errorURL){
   try{
    console.log(Items.length > 0)
    let new_record = new invoice({
                id: mongoose.Types.ObjectId(),
                invoiceNumber: invoiceNumber,
                merchantapikey: merchantKey,
                Items: Items.length > 0 ? Items : [{}] ,
                customerName: customerName,
                email: email,
                mobileNumber:mobileNumber,
                duedate: duedate,
                additionalNotes: additionalNotes,
                payment_reason : payment_reason,
                currency: currency,
                totalAmount:totalAmount,
                orderId: orderId,
                callbackURL: callbackURL,
                errorURL: errorURL,
                status: 0
            })
            let newrecord = await new_record.save()
          return {status  : 200 , data : newrecord, message : "Successfully Data", }
        }
    catch(error){
        console.log("paymentHostedController storeInvoice",error)
        return {status  : 400 , data : {}, message : error.message }
    }            
}

async function storepaylinkPayment(invoice_id)
{
    try{
        let new_record = new paylinkPayment({
            id          : mongoose.Types.ObjectId(),
            invoice_id  : invoice_id,
            status      : 0
        })
        let response = await new_record.save()
        return {status  : 200 , data : response, message : "Successfully Data", }
        }
     catch(error){
         console.log("paymentHostedController storepaylinkPayment",error)
         return {status  : 400 , data : {}, message : error.message }
     }            
}

async function assignPaymentLinkMerchantWallet(networkType,api_key,amount,currency,callbackURL,errorURL,payLinkId,orderType,token)
{
    try{
            let account = await poolwalletController.getPoolWalletID(networkType)
            let currentDateTemp = Date.now();
            let currentDate = parseInt((currentDateTemp / 1000).toFixed());
            const newRecord = new paymentLinkTransactionPool({
                id              : mongoose.Types.ObjectId(), 
                api_key         : api_key,
                poolwalletID    : account.id,
                amount          : amount,
                currency        : currency,
                callbackURL     : callbackURL,
                errorURL        : errorURL,
                payLinkId       : payLinkId,
                orderType       : orderType,
                clientToken     : token,
                status          : 0,
                walletValidity  : currentDate,
                timestamps      : new Date().getTime()
            });
            let payment_link = await newRecord.save()
            await poolWallet.findOneAndUpdate({ 'id': payment_link.poolwalletID }, { $set: { status: 1 } })
            let data = { transactionID: payment_link.id, address: account.address, walletValidity: payment_link.walletValidity }
            return {status  : 200 , data : data, message : "Successfully Data", }
        }
     catch(error)
     {
         console.log("paymentHostedController assignPaymentLinkMerchantWallet",error)
         return {status  : 400 , data : {}, message : error.message }
     }            
}

module.exports =
{
    async createHostePayment(req, res) {
        try{
        let invoiceObject   = req.body
        let invoiceid       = ''
        var merchantKey     = req.headers.authorization
        const duedate       = new Date(req.body.duedate);
        const currentdate   = new Date();
        
        if (duedate <= currentdate) 
        {
            return res.json({ status: 400, data: {}, message: "Invalid Date" })
        }
       let store_invoice  = await storeInvoice(
            invoiceObject.invoiceNumber,
            merchantKey,
            invoiceObject.items,
            req.body.customerName,
            req.body.email,
            req.body.mobileNumber,
            req.body.duedate,
            req.body.additionalNotes,
            req.body.payment_reason,
            req.body.currency,
            req.body.totalAmount,
            req.body.orderId,
            req.body.callbackURL,
            req.body.errorURL,
            )
       if(store_invoice.status != 200){
           return res.json(store_invoice)
        }
        let storepaylink  = await storepaylinkPayment(store_invoice.data.id)
        if(storepaylink.status != 200)
        {
            return res.json(storepaylink)
        }
        let link = process.env.HOSTED_PAYMENT_LINK.replace("paylinkid",storepaylink.data.id) 
        res.json(
        {
            "status": 200,
            "data": 
            {
                "url": link
            },
            "message": "Success"
        })
    }
    catch(error)
     {
         console.log("paymentHostedController createHostePayment",error)
         return {status  : 400 , data : {}, message : error.message }
     }      
    },

}




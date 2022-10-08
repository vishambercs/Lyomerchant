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
const axios = require('axios')
var qs = require('qs');

async function storeInvoice(invoiceNumber, merchantKey, Items, customerName, email, mobileNumber, duedate, additionalNotes, payment_reason, currency, totalAmount, orderId, callbackURL, errorURL) {
    try {

        let new_record = new invoice({
            id: mongoose.Types.ObjectId(),
            invoiceNumber: invoiceNumber,
            merchantapikey: merchantKey,
            Items: (Items != null && Items != "") ? Items : [{}],
            customerName: customerName,
            email: email,
            mobileNumber: mobileNumber,
            duedate: duedate,
            additionalNotes: additionalNotes,
            payment_reason: payment_reason,
            currency: currency,
            totalAmount: totalAmount,
            orderId: orderId,
            callbackURL: callbackURL,
            errorURL: errorURL,
            status: 0
        })
        let newrecord = await new_record.save()
        return { status: 200, data: newrecord, message: "Successfully Data", }
    }
    catch (error) {
        console.log("paymentHostedController storeInvoice", error)
        return { status: 400, data: {}, message: error.message }
    }
}

async function storepaylinkPayment(invoice_id) {
    try {
        let new_record = new paylinkPayment({
            id: mongoose.Types.ObjectId(),
            invoice_id: invoice_id,
            timestamps: new Date().getTime(),
            status: 0
        })
        let response = await new_record.save()
        return { status: 200, data: response, message: "Successfully Data", }
    }
    catch (error) {
        console.log("paymentHostedController storepaylinkPayment", error)
        return { status: 400, data: {}, message: error.message }
    }
}

async function assignPaymentLinkMerchantWallet(networkType, api_key, amount, currency, callbackURL, errorURL, payLinkId, orderType, token) {
    try {
        let account = await poolwalletController.getPoolWalletID(networkType)
        let currentDateTemp = Date.now();
        let currentDate = parseInt((currentDateTemp / 1000).toFixed());
        const newRecord = new paymentLinkTransactionPool({
            id: mongoose.Types.ObjectId(),
            api_key: api_key,
            poolwalletID: account.id,
            amount: amount,
            currency: currency,
            callbackURL: callbackURL,
            errorURL: errorURL,
            payLinkId: payLinkId,
            orderType: orderType,
            clientToken: token,
            status: 0,
            walletValidity: currentDate,
            timestamps: new Date().getTime()
        });
        let payment_link = await newRecord.save()
        await poolWallet.findOneAndUpdate({ 'id': payment_link.poolwalletID }, { $set: { status: 1 } })
        let data = { transactionID: payment_link.id, address: account.address, walletValidity: payment_link.walletValidity }
        return { status: 200, data: data, message: "Successfully Data", }
    }
    catch (error) {
        console.log("paymentHostedController assignPaymentLinkMerchantWallet", error)
        return { status: 400, data: {}, message: error.message }
    }
}

module.exports =
{
    async createHostePayment(req, res) {
        try {
            let invoiceObject = req.body
            let invoiceid = ''
            var merchantKey = req.headers.authorization
            const duedate = new Date(req.body.duedate);
            const currentdate = new Date();

            if (duedate <= currentdate) {
                return res.json({ status: 400, data: {}, message: "Invalid Date" })
            }
            console.log(req.body.items)
            const sum = (req.body.items != null && req.body.items != "") ? req.body.items.reduce((accumulator, object) => {
                return accumulator + object.amount;
            }, 0) : req.body.totalAmount;

            if (req.body.totalAmount != sum) {
                return res.json({ status: 400, data: {}, message: "Invalid Total Amount" })
            }

            let store_invoice = await storeInvoice(
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
            if (store_invoice.status != 200) {
                return res.json(store_invoice)
            }

            let storepaylink = await storepaylinkPayment(store_invoice.data.id)
            if (storepaylink.status != 200) {
                return res.json(storepaylink)
            }
            let link = process.env.HOSTED_PAYMENT_LINK.replace("paylinkid", storepaylink.data.id)
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
        catch (error) {
            console.log("paymentHostedController createHostePayment", error)
            return { status: 400, data: {}, message: error.message }
        }
    },

    async IPN_Testing(req, res) {
        try {
            let invoiceObject = req.body
            let datarray =
            {
                "transaction_status": "Completed",
                "transaction_id": "63416e45ff8850ba2ae773f1",
                "address": "TKqwaMbj8Uj8zFt66XiNg1Xx1mHspWR4b2",
                "coin": "USDT",
                "network": "TRX20",
                "crypto_amount": 1,
                "invoicenumber": "Ax-10",
                "fiat_amount": "1",
                "currency": "AED"
            }

            var data = qs.stringify( datarray);
            var config = {
              method: 'post',
              url:  req.body.ipn_url,
              headers: { 
                'Authorization':  req.body.ipn_secret_key, 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              data : data
            };
            await axios(config) .then(function (response) {
              console.log("Success IPN================",JSON.stringify(response.data));
              res.json({ status: 200, data:JSON.stringify(response.data), message: "Response" })
            })
            .catch(function (error) 
            {
                res.json({ status: 400, data: {}, message: error.message })
            });



        }
        catch (error) {
            console.log("paymentHostedController createHostePayment", error)
          
            res.json({ status: 400, data: {}, message: error.message })
        }
    },
}




const invoice = require('../Models/invoice');
const paylinkPayment = require('../Models/payLink');
const transaction = require("../controllers/transcationController")
var mongoose = require('mongoose');
let message = ''
let status = ''
module.exports =
{
    async storeInvoice(req, res) {
        //transaction.assignMerchantWallet(req)
        let invoiceObject = req.body
        let invoiceid = ''
        var merchantKey  = req.headers.authorization
        try {
            let new_record = new invoice({
                id: mongoose.Types.ObjectId(),
                invoiceNumber: invoiceObject.invoiceNumber,
                merchantId: merchantKey,
                Items: invoiceObject.Items,
                status: true
            })
            console.log(new_record)
            let res = await new_record.save()
            invoiceid = res.id
            message= "Invoice created"
            status = 400
        }
        catch (error) {
            console.log("new invoice error", error)
            invoiceid = ''
            message = error
            status = 200
            return error
        }

        res.json({ status: status, data: { "invoiceid": invoiceid }, message: message })
    },

    async getPaymentLink(req, res) {

        try {
            var merchantKey  = req.headers.authorization
            let new_record = new paylinkPayment({
                id: mongoose.Types.ObjectId(),
                invoiceNumber: req.body.invoiceId,
                merchantId: merchantKey,
                apiKey: req.body.apiKey,
                customerName: req.body.customerName,
                invoiceNumber: req.body.invoiceNumber,
                email: req.body.email,
                mobileNumber: req.body.mobileNumber,
                duedate: req.body.duedate,
                additionalNotes: req.body.additionalNotes,
                currency: req.body.currency,
                totalAmount: req.body.totalAmount,
                orderId: req.body.orderId,
                status: req.body.status
            })
            console.log(new_record)
            let res = await new_record.save()
            responseObj = res._id
            message = "payment initiated" 
            status = 400
        }
        catch (error) {
            console.log("new invoice error", error)
            message = error.message
            status = 200
        }
        res.json({ status: status, data: { "paymentId": message }, message: message })
    },
    async getAllInvoices(req, res) {
        try {
            console.log(new_record)
            let res = await new_record.save()
            responseObj = res._id
        }
        catch (error) {
            console.log("new invoice error", error)
            responseObj = error
        }
        res.json({ status: 200, data: { "paymentId": responseObj }, message: "payment initiated" })
    },
    async getOneInvoice(req, res) {
        try {
            console.log(new_record)
            let res = await new_record.save()
            responseObj = res._id
        }
        catch (error) {
            console.log("new invoice error", error)
            responseObj = error
        }
        res.json({ status: 200, data: { "paymentId": responseObj }, message: "payment initiated" })
    }
}


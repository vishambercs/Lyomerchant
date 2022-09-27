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
module.exports =
{
    async storeInvoice(req, res) {
        let invoiceObject = req.body
        let invoiceid = ''
        var merchantKey = req.headers.authorization
        const duedate = new Date(req.body.duedate);
        const currentdate = new Date();
        if (duedate <= currentdate) {
            return res.json({ status: 400, data: {}, message: "Invalid Date" })
        }
        try {
            let new_record = new invoice({
                id: mongoose.Types.ObjectId(),
                invoiceNumber: invoiceObject.invoiceNumber,
                merchantapikey: merchantKey,
                Items: invoiceObject.Items,
                customerName: req.body.customerName,
                email: req.body.email,
                mobileNumber: req.body.mobileNumber,
                duedate: req.body.duedate,
                additionalNotes: req.body.additionalNotes,
                currency: req.body.currency,
                totalAmount: req.body.totalAmount,
                orderId: req.body.orderId,
                status: 0
            })
            let newrecord = await new_record.save()
            invoiceid = newrecord.id
            message = "Invoice created"
            status = 200
        }
        
        catch (error) {
            console.log("new invoice error", error)
            invoiceid = ''
            message = error
            status = 400
        }
        res.json({ status: status, data: { "invoiceid": invoiceid }, message: message })
    },

    async deleteInvoice(req, res) {
        try {
            await invoice.updateOne({ 'id': req.body.id },
                {
                    $set:
                    {
                        status: 5,
                        deleted_by: req.body.deleted_by,
                        deleted_at: new Date().toString(),
                    }
                }).then(async (val) => {
                    if (val != null) {
                        res.json({ status: 200, message: "Successfully", data: req.body.id })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async getPaymentLink(req, res) {
        let responseObj = ''
        try {
            var merchantKey = req.headers.authorization
            let new_record = new paylinkPayment({
                id: mongoose.Types.ObjectId(),
                invoice_id: req.body.invoiceid,
                status: 0
            })
            console.log(new_record)
            let response = await new_record.save()
            responseObj = response.id
            message = "payment initiated"
            status = 200
        }
        catch (error) {
            console.log("new invoice error", error)
            message = error.message
            status = 400
        }
        res.json({ status: status, data: { "paymentId": responseObj }, message: message })
    },


    async getAllInvoices(req, res) {
        var merchantKey = req.headers.authorization
        let response = ''
        let invoiceNumber = ''
        let status = 200;
        try {
            let findResult = await invoice.find({ merchantapikey: merchantKey, status: { $ne: 5 }, });
            response = findResult
        }
        catch (error) {
            response = "someting went wrong"
            status = 400
        }

        res.json({ status: status, data: response, message: "get all invoices" })
    },

    async verifyPaymentLink(req, res) {
        try {
            let paylinksData = await paylinkPayment.aggregate([
                { $match: { id: req.body.paymentId , status : 0 } },
                {
                    $lookup: {
                        from: "invoices", // collection to join
                        localField: "invoice_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "invoicesDetails"// output array field
                    }
                    
                },
                {
                    $lookup: {
                        from: "clients", // collection to join
                        localField: "invoicesDetails.merchantapikey",//field from the input documents
                        foreignField: "api_key",//field from the documents of the "from" collection
                        as: "clientsdetails"// output array field
                    }
                    
                },
                {   
                    "$project":
                    {
                        "clientsdetails.api_key": 0,
                        "clientsdetails.authtoken": 0,
                        "clientsdetails.token": 0,
                        "clientsdetails.secret": 0,
                        "clientsdetails.qrcode": 0,
                        "clientsdetails.hash": 0,
                        "clientsdetails.emailstatus": 0,
                        "clientsdetails.loginstatus": 0,
                        "clientsdetails.emailtoken": 0,
                        "clientsdetails.status": 0,
                        "clientsdetails.two_fa": 0,
                        "clientsdetails.password": 0,
                        "clientsdetails.kycLink": 0,
                        "clientsdetails.manual_approved_by": 0,
                        "clientsdetails.manual_approved_at": 0,
                        "clientsdetails.deleted_by": 0,
                        "clientsdetails.deleted_at": 0,
                       
                    }
                }

            ])
         
           
            if (paylinksData[0].timestamps == undefined) 
            {
               return res.json({ status: 400, data: [], message: "This Link is expired." })
            }

            const previousdate = new Date(parseInt(paylinksData[0].timestamps));
            const currentdate = new Date().getTime()
            var diff = currentdate - previousdate.getTime();
            var minutes = (diff / 60000)
            if (minutes > 10) 
            {
               return res.json({ status: 400, data: [], message: "This Link is expired." })
            }
            res.json({ status: 200, data: paylinksData, message: "Successfully Done" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }

    },

    async cancelpaymentLink(req, res) {
        try 
        { 
            let paylinks = await paylinkPayment.findOneAndUpdate({ 'id':req.body.paymentId  }, { $set: { status : 1 } } ,{ returnDocument: 'after' })
            res.json({ status: 200, data: paylinks, message: "Successfully Done" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }

    },
    async assignPaymentLinkMerchantWallet(req, res) {
        try 
        {
            var networkType = req.body.networkType
            let account = await poolwalletController.getPoolWalletID(networkType)
            let currentDateTemp = Date.now();
            let currentDate = parseInt((currentDateTemp / 1000).toFixed());
            const newRecord = new paymentLinkTransactionPool({
                id              : mongoose.Types.ObjectId(), 
                api_key         : req.headers.authorization,
                poolwalletID    : account.id,
                amount          : req.body.amount,
                currency        : req.body.currency,
                callbackURL     : req.body.callbackURL,
                errorURL     : req.body.errorURL,
                payLinkId       : req.body.payLinkId,
                orderType       : req.body.orderType,
                clientToken     : req.body.token,
                status          : 0,
                walletValidity  : currentDate,
                timestamps      : new Date().getTime()
            });
            newRecord.save().then(async (val) => {
                await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                let data = { transactionID: val.id, address: account.address, walletValidity: val.walletValidity }
                res.json({ status: 200, message: "Payment Link Wallet Assigned Successfully", data: data })
            }).catch(error => {
                console.log("errorr", error)
                res.json({ status: 401, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async getPaymentLinkTransList(req, res) {
        try {

            let searchParameters = { "api_key": req.headers.authorization }

            if ((req.body.networkid != "" && req.body.networkid != undefined) && (req.body.status != "" && req.body.status != undefined)) {
                searchParameters = { "api_key": req.headers.authorization, "poolWallet.network_id": req.body.networkid, "status": parseInt(req.body.status) }
            }
            else if (req.body.networkid != "" && req.body.networkid != undefined) {
                searchParameters = { "api_key": req.headers.authorization, "poolWallet.network_id": req.body.networkid }
            }
            else if (req.body.status != "" && req.body.status != undefined) {
                searchParameters = { "api_key": req.headers.authorization, "status": parseInt(req.body.status) }
            }
            await paymentLinkTransactionPool.aggregate(
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
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async verifyFastPayment(req, res) {
        let findResult = ''
        let response = []
        let status = 200;
        try {
            findResult = await fastPaymentCode.findOne({
                "storeid": req.body.businessName,
            })
            console.log("fastCode number", findResult)
            response = findResult
        }
        catch (error) {
            response = "someting went wrong"
            status = 400
            response = error
        }
        res.json({ status: status, data: response, message: "verify fast code" })
    },
    async verifyFastCode(req, res) {
        // var token = ''
        // let storeProfile = ''
        // let findResult = ''
        // let response = []
        // let status = 200;
        try {
            // let findResult = await fastPaymentCode.find({ "fastcodes": req.body.fastCode })
            // let findResult = await fastPaymentCode.find({ "fastcodes": req.body.fastCode })
            let findResult = await fastPaymentCode.aggregate(
                [
                    { $match: { "fastcodes": req.body.fastCode } },
                    {
                        $lookup: {
                            from: "merchantstores", // collection to join
                            localField: "storeid",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "storesDetails"// output array field
                        },
                    },
                ])
            res.json({ status: 200, data: findResult, message: "Success" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async createFastCode(req, res) {
        let message = ''
        let status = 200
        let storeProfile = ''
        var merchantKey = req.headers.authorization
        let dataResponse = ''
        let fastCodeObject = []
       
        try {
           
            console.log("Math", Math.floor(Math.random() * 100000))
            const fastPayCode = new fastPaymentCode({
                id: mongoose.Types.ObjectId(),
                storeid: req.body.storeid,
                fastcodes: Math.floor(Math.random() * 100000),
                status: 1,
            })
            let val = await fastPayCode.save()
            message = "Fast Code Created Successfully"
            status = 200
            dataResponse = val
        }
        catch (error) {
            console.log("error", error)
            message = "Store does not exist"
            status = 400
            dataResponse = 'null'
        }
        res.json({ status: status, data: dataResponse, message: message })
    },

    async deleteFastCode(req, res) {
        let message = ''
        let status = 200
        var merchantKey = req.headers.authorization
        let dataResponse = ''
        let fastCodeObject = []
        try {
            await fastPaymentCode.findOne({ "merchantId": merchantKey }).then(async (val) => {
                if (val) {
                    fastCodeObject = val
                    console.log("data........", fastCodeObject)
                    for (i = 0; i < fastCodeObject.fastCodes.length; i++) {
                        if (fastCodeObject.fastCodes[i].businessName == req.body.businessName) {
                            console.log("business name---------------------", fastCodeObject.fastCodes[i].businessName, i)
                            fastPaymentCode.updateMany(
                                {},
                                { $pull: { fastCodes: [{ businessName: req.body.businessName }] } }
                            )
                            dataResponse = fastCodeObject
                            //console.log("data........", dataResponse)
                        }
                    }
                }
            })
        }


        catch (error) {
            message = error
            status = 400
            dataResponse = 'null'
        }
        res.json({ status: status, data: dataResponse, message: message })
    }
}




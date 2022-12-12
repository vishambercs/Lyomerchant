const invoice            = require('../../Models/invoice');
const paylinkPayment     = require('../../Models/payLink');
const admin              = require('../../Models/admin');
const InvoiceUpdateLogs  = require('../../Models/InvoiceUpdateLogs');
const transaction        = require("../transcationpoolController")
const CurrencyController = require("../Masters/CurrencyController")
const fastPaymentCode    = require('../../Models/fastPaymentCode');
const merchantStore      = require('../../Models/merchantstore');

const paymentLinkTransactionPool = require('../../Models/paymentLinkTransactionPool');
const clients                    = require('../../Models/clients');
const networks                   = require('../../Models/network');
const poolWallet                 = require('../../Models/poolWallet');
var crypto                       = require("crypto");
var mongoose = require('mongoose');
var CryptoJS = require('crypto-js')
var poolwalletController = require('../poolwalletController');
let message = ''
let status = ''
const jwt = require('jsonwebtoken');
module.exports =
{
    
    async get_All_Invoice_For_Admin(req, res) {
        let queryOptions = {}
        if (Object.keys(req.body).indexOf("merchantemail") != -1) {
            var customeremail = req.body.merchantemail
            queryOptions["clientdetails"] = customeremail
        }
        if (Object.keys(req.body).indexOf("fromdate") != -1) {
            var fromdate = req.body.fromdate
            var fromdated = new Date(fromdate)
            queryOptions["createdAt"] = { $gte: fromdated }
        }
        if (Object.keys(req.body).indexOf("todate") != -1) {
            var fromdate = Object.keys(req.body).indexOf("fromdate") != -1 ? req.body.fromdate : null
            var todate = req.body.todate
            var todateed = new Date(todate)
            todateed.setDate(todateed.getDate() + 1);
            var inputtodateed = new Date(todateed.toISOString());
            var fromdated = new Date(fromdate)
            var inputfromdated = new Date(fromdated.toISOString());
            let dateRange = fromdate != null ? { $gte: inputfromdated, $lte: inputtodateed } : { $lte: inputtodateed }
            queryOptions["createdAt"] = dateRange
        }
        if (Object.keys(req.body).indexOf("status") != -1) 
        {
             queryOptions["status"] = req.body.status
        }

        let limit = req.body.limit == "" || req.body.limit == undefined ? 25 : parseInt(req.body.limit);
        let skip = req.body.skip == "" || req.body.skip == undefined ? 0 : parseInt(req.body.skip);
        let transactionPoolData = await invoice.find(queryOptions).populate([
            { path: "clientdetails", select: "id email first_name last_name type _id" },
        ]).sort({ createdAt: -1 }).limit(limit).skip(skip).lean();
        res.status(200).json({ status: 200, data: transactionPoolData, });
    },
    async storeInvoice(req, res) {
        let invoiceObject = req.body
        let invoiceid = ''
        var merchantKey = req.headers.authorization
        const client = await clients.findOne({ api_key: merchantKey })
      
        const duedate = new Date(req.body.duedate);
        const currentdate = new Date();
        if (duedate <= currentdate) {
            return res.json({ status: 400, data: {}, message: "Invalid Date" })
        }
        try {
            let new_record = new invoice({
                id: mongoose.Types.ObjectId(),
                invoiceNumber: invoiceObject.invoiceNumber,
                clientdetails: client._id,
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
            var merchantKey          = req.headers.authorization
            let invoicedata          = await invoice.findOne({id : req.body.invoiceid})
            let paylink_data_Payment = await paylinkPayment.findOneAndUpdate({invoice_id : req.body.invoiceid}
                ,{$set : {timestamps :  new Date().getTime() }}, { "returnDocument" : 'after' }
                )
            if(paylink_data_Payment == null )
            {
            let new_record = new paylinkPayment({
                id              : mongoose.Types.ObjectId(),
                invoicedetails  : invoicedata._id,
                invoice_id      : req.body.invoiceid,
                timestamps      : new Date().getTime(),
                status          : 0
            })
            let response = await new_record.save()
            responseObj = response.id
            message = "payment initiated"
            status = 200
            return res.json({ status: 200, data: { "paymentId": responseObj , "trans_details": null}, message: "Success" })
            }    

            
            let payment_pooldata    = await paymentLinkTransactionPool.findOne({ payLinkId : paylink_data_Payment.id})
         
            if(payment_pooldata != null && paylink_data_Payment != null )
            {
                
                let payment_pool_data    = await paymentLinkTransactionPool.findOneAndUpdate({ payLinkId : paylink_data_Payment.id}
                    ,{$set : {timestamps :  new Date().getTime() }}, { "returnDocument" : 'after' } ).populate([
                    { path: "pwid",         select: "network_id id balance address remarks _id" },
                    { path: "nwid",         select: "id coin network _id" },
                    { path: "clientdetail", select: "id email first_name last_name type _id" },
                    { path: "paymentdetails", select:"id invoice_id ",
                    populate :[
                       { path: "invoicedetails" , select:"id customerName payment_reason email mobileNumber duedate totalAmount  _id"  }
                    ]},
                ])
                return  res.json({ status: 200, data: { "paymentId": paylink_data_Payment.id,"trans_details": payment_pool_data }, message: "Get the data" })
            }
          
            return  res.json({ status: 200, data: { "paymentId": paylink_data_Payment.id,"trans_details": null}, message: "Get the data" })
           
        }
        catch (error) {
            console.log("new invoice error", error)
            message = error.message
            status = 400
            return  res.json({ status: status, data: { "paymentId" : null , "trans_details": null}, message: "Error" })
        }
      
    },
    async getAllInvoices(req, res) {
        var merchantKey = req.headers.authorization
        let response = ''
        let invoiceNumber = ''
        let status = 200;
        try {
            let findResult = await invoice.find({ merchantapikey: merchantKey, status: { $ne: 5 } }, { callbackURL: 0, errorURL: 0, merchantapikey: 0 });
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
                { $match: { id: req.body.paymentId } },
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

            if (paylinksData[0].status == 1) {
                return res.json({ status: 400, data: {}, message: "Paylink is expired" })
            }

            if (paylinksData[0].status != 0) {
                return res.json({ status: 200, data: paylinksData, message: "Success" })
            }

            if (paylinksData[0].status != 0) {
                return res.json({ status: 200, data: paylinksData, message: "Success" })
            }


            if (paylinksData[0].timestamps == undefined) {
                return res.json({ status: 400, data: [], message: "This Link is expired." })
            }

            const previousdate = new Date(parseInt(paylinksData[0].timestamps));
            const currentdate = new Date().getTime()
            var diff = currentdate - previousdate.getTime();
            var minutes = (diff / 60000)
            if (minutes > 10) {
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
        try {
            let paylinks = await paylinkPayment.findOneAndUpdate({ 'id': req.body.paymentId }, { $set: { status: 1 } }, { returnDocument: 'after' })
            res.json({ status: 200, data: paylinks, message: "Successfully Done" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async assignPaymentLinkMerchantWallet(req, res) {
        try {
            var networkType     = req.body.networkType
            let account         = await poolwalletController.getPoolWalletID(networkType)
            let network_details = await networks.findOne({ 'id': networkType })
            let client          = await clients.findOne({ 'api_key': req.headers.authorization })
            let payLink         = await paylinkPayment.findOne({ 'id': req.body.payLinkId })
            let invoicedata     = await invoice.findOne({ 'id': payLink.invoice_id })
            let pricedata       = 0
            console.log("invoicedata",invoicedata)
            if(invoicedata != null)
            {
                pricedata    = await CurrencyController.priceConversitionChangesforpaymentlink(network_details.id,invoicedata.currency,req.headers.authorization )
            }
            else
            {
                pricedata    = await CurrencyController.priceConversitionChangesforpaymentlink(network_details.id,req.body.currency,req.headers.authorization )
            }

            
            console.log("pricedata",pricedata)
            if(pricedata == 0)
            {
                return res.json({ status: 400, data: pricedata, message: "We do not support the currency " + invoicedata.currency })
            }
            let amount_total    = invoicedata != null ? invoicedata.totalAmount : req.body.amount
            let cryptoamount    = parseFloat(amount_total) / parseFloat(pricedata)
            let currentDateTemp = Date.now();
            let currentDate     = parseInt((currentDateTemp / 1000).toFixed());
            const newRecord     = new paymentLinkTransactionPool({
                id: mongoose.Types.ObjectId(),
                api_key: req.headers.authorization,
                paymenttype: req.body.paymenttype,
                invoicedetails:invoicedata._id,
                poolwalletID: account.id,
                amount: cryptoamount,
                currency: req.body.currency,
                callbackURL: req.body.callbackURL,
                errorURL: req.body.errorURL,
                payLinkId: req.body.payLinkId,
                orderType: req.body.orderType,
                clientToken: req.body.token,
                status: 0,
                walletValidity: currentDate,
                timestamps: new Date().getTime(),
                clientdetail: client._id,
                pwid: account._id,
                nwid: network_details._id,
                paymentdetails: payLink._id,
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
    async updatestoreInvoice(req, res) {
        try {
            const paylinkPayments = await paymentLinkTransactionPool.find({});
            console.log("====client===", paylinkPayments.length)
            paylinkPayments.forEach(async (element) => {
                // const clientinvoices = await invoice.findOne({ id: element.invoice_id })
                const payLink = await paylinkPayment.findOne({ 'id': element.payLinkId })
                const clientinvoices = await invoice.findOne({ id: payLink.invoice_id })
                if (payLink != null) {
                    console.log("====client===", payLink._id)
                    const invoiceData = await paymentLinkTransactionPool.updateMany({ id: element.id }, 
                        { $set: { invoicedetails: clientinvoices._id } }, { 'returnDocument': 'after' })
                    console.log("====invoiceData===", invoiceData)
                }
            });

            res.json({ status: 200, data: { "invoices": paylinkPayments }, message: "" })
        }
        catch (error) {
            res.json({ status: 400, data: { "invoices": "" }, message: error })
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
        try {
            let findResult = await fastPaymentCode.findOne({ "storeid": req.body.businessName, "status": 1 })
            res.json({ status: 200, data: findResult, message: "verify fast code" })
        }
        catch (error) {
            console.log("verifyFastPayment error", error)
            res.json({ status: 400, data: findResult, message: "error" })
        }
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
                    { $match: { "fastcodes": req.body.fastCode, status: 1 } },
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


            // const fastPayCode = new fastPaymentCode({
            //     id       : mongoose.Types.ObjectId(),
            //     storeid  : req.body.storeid,
            //     fastcodes: Math.floor(Math.random() * 100000),
            //     status: 1,
            // })
            await fastPaymentCode.updateMany({ storeid: req.body.storeid }, { $set: { status: 0 } })

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
    },
    async updateInvoiceByAdmin(req, res) {
        let message = ''
        let status = 200
        var adminkey = req.headers.authorization
        var invoiceid = req.body.invoiceid
        let dataResponse = ''
        let fastCodeObject = []
        try 
        {
           let invoiceData =  await invoice.findOneAndUpdate({ "id": invoiceid },{$set: { status : req.body.status } } , { returnDocument : 'after' })
            
           if(invoiceData == null)
           {
            return res.json({ status: 400, data: null, message: "Invalid invoice ID" })
           }
           
           let paylinkdata =  await paylinkPayment.findOneAndUpdate({ "invoice_id": invoiceData.id },{$set:{status : req.body.status }} , { returnDocument : 'after' })
           let paymentLinkdata = null
           
           if(paylinkdata != null)
           {
            paymentLinkdata =  await paymentLinkTransactionPool.findOneAndUpdate({ "payLinkId": paylinkdata.id },{$set:{status : req.body.status }} , { returnDocument : 'after' })
           }

           if(paymentLinkdata != null)
           {
           let datapoolWallet =  await poolWallet.findOneAndUpdate({ "id": paymentLinkdata.poolwalletID },{$set:{status : (req.body.status == 1 || req.body.status == 3) ? 0 : 1  }} , { returnDocument : 'after' })
           }
           
           let admindata =  await admin.findOne({ "api_key": adminkey })
           let InvoiceUpdateLog =  await InvoiceUpdateLogs.insertMany({ 
            admindetails:admindata._id,
            paymentlinktransactiondetails: paymentLinkdata != null ?  paymentLinkdata._id : null,
            invoicedetails: invoiceData._id , 
            paylinkdetails: paylinkdata != null ?  paylinkdata._id : null })
           
           res.json({ status: 200, data: invoiceData, message: "Updated" })


        }
     catch (error) 
        {
            console.log("updateInvoice",error)
            res.json({ status: 400, data: null, message: "Error" })
        }
        
    }
}




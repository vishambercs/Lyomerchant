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

async function storeInvoice(invoiceNumber,merchantKey,Items,customerName,email,mobileNumber,duedate,additionalNotes,currency,totalAmount,orderId,itemlist){
   try{
    let new_record = new invoice({
                id: mongoose.Types.ObjectId(),
                invoiceNumber: invoiceNumber,
                merchantapikey: merchantKey,
                Items: Items,
                customerName: customerName,
                email: email,
                mobileNumber:mobileNumber,
                duedate: duedate,
                additionalNotes: additionalNotes,
                currency: currency,
                totalAmount:totalAmount,
                orderId: orderId,
                itemlist : itemlist,
                status: 0
            })
            let newrecord = await new_record.save()
          return {status  : 200 , data : newrecord, message : "Successfully Data", }
        }
    catch(error){
        console.log(error)
        return {status  : 400 , data : {}, message : error }
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

       let store_invoice  = await storeInvoice(
            invoiceObject.invoiceNumber,
            merchantKey,
            invoiceObject.Items,
            req.body.customerName,
            req.body.email,
            req.body.mobileNumber,
            req.body.duedate,
            req.body.additionalNotes,
            req.body.currency,
            req.body.totalAmount,
            req.body.orderId,
            req.body.itemlist
            )

        if(store_invoice.status != 200){
           return res.json(store_invoice)
        }

       
        let new_record = new paylinkPayment({
            id: mongoose.Types.ObjectId(),
            invoice_id: store_invoice.data.id,
            status: 0
        })
        let response = await new_record.save()
        
        let paymenturl = "https://link.sandbox.lyomerchant.com/paylink/"+response.id
        res.json({ status: 200, data: {"url" : paymenturl}, message: "Please use this link for payment" })
    }
    catch(error){
        res.json({ status: 400, data: null, message: "Internal Server Error" })
    }
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
        // console.log("payment id", req.body.paymentId)
        // let findResult = ''
        // let response = []

        // let status = 200;
        // try {
        //     findResult = await paylinkPayment.find({
        //         id: req.body.paymentId,
        //     });
        //     console.log("invoice number", findResult)
        //     response.push(findResult)
        //     console.log(response)
        //     invoiceNumber = findResult[0].invoiceNumber
        //     console.log("invoice number", invoiceNumber)

        // }
        // catch (error) {
        //     response = "something went wrong"
        //     status = 400
        //     response = error
        // }
        // try {
        //     if (invoiceNumber) {
        //         response = await invoice.find({
        //             invoiceNumber: invoiceNumber
        //         });
        //         console.log("invoice", response)
        //     }
        // }
        // catch (error) {

        // }
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
            ])
            res.json({ status: 200, data: paylinksData, message: "Successfully Done" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }

    },
    async assignPaymentLinkMerchantWallet(req, res) {
        try {
            var networkType = req.body.networkType
            let account = await poolwalletController.getPoolWalletID(networkType)
            let currentDateTemp = Date.now();
            let currentDate = parseInt((currentDateTemp / 1000).toFixed());
            const newRecord = new paymentLinkTransactionPool({
                id: mongoose.Types.ObjectId(), // crypto.randomBytes(20).toString('hex'),
                api_key: req.headers.authorization,
                poolwalletID: account.id,
                amount: req.body.amount,
                currency: req.body.currency,
                callbackURL: req.body.callbackURL,
                payLinkId: req.body.payLinkId,
                orderType: req.body.orderType,
                clientToken: req.body.token,
                status: 0,
                walletValidity: currentDate,
                timestamps: new Date().getTime()
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
        // try {
        //     findResult = await fastPaymentCode.find({
        //         "fastcodes": req.body.fastCode
        //     })

        //     let id = findResult.id
        //     token = jwt.sign({ id: id }, process.env.AUTH_KEY, { expiresIn: '5m' });
        //     try{
        //         console.log(req.headers.authorization,findResult[0].fastCodes[0].businessName)
        //         storeProfile = await merchantStore.findOne({
        //         storename:findResult[0].fastCodes[0].businessName
        //     });
        // }
        // catch (error){

        // }
        //     response = (findResult)

        // }
        // catch (error) {
        //     response = "someting went wrong"
        //     status = 400
        //     response = error
        // }
        // if (response == 0) status = 400
        // //res.json({ status: status, data: {"data":response,"storeProfile":storeProfile}, message: "verify fast code" })
        // res.json({ status: status, data: response,storeProfile,token, message: "verify fast code" })

    },

    async createFastCode(req, res) {
        let message = ''
        let status = 200
        let storeProfile = ''
        var merchantKey = req.headers.authorization
        let dataResponse = ''
        let fastCodeObject = []
        // if(!req.body.businessName||req.body.businessName==''){
        //     console.log("no name")
        //     message = "Business name is missing"
        //     status = 400
        //     res.json({ status: status, data: dataResponse, message: message })
        //     return
        // }
        try {
            // await merchantStore.findOne({ "storename": req.body.businessName }).then(async (val) => {
            // console.log("valueeeeeeeeee",val)
            // if(val.clientapikey == req.headers.authorization ){          
            // await fastPaymentCode.findOne({ "merchantId": merchantKey }).then(async (val) => {
            //     if (val) {
            //         fastCodeObject = val
            //         console.log("data........", fastCodeObject)
            //         for (i = 0; i < fastCodeObject.fastCodes.length; i++) {
            //             if (fastCodeObject.fastCodes[i].businessName == req.body.businessName) {
            //                 dataResponse = fastCodeObject.fastCodes[i]
            //                 console.log("data........", dataResponse)
            //             }
            //         }
            //         if (dataResponse == 0) {
            //             let code = parseInt(Math.random() * (1000000 - 100000));
            //             fastCodeObject.fastCodes.push({ "businessName": req.body.businessName, "fastCode": code, "status": "active" })
            //             console.log("Object is", fastCodeObject.fastCodes)
            //             await fastPaymentCode.updateOne({ 'id': fastCodeObject.id },
            //                 {
            //                     $set:
            //                     {
            //                         "fastCodes": fastCodeObject.fastCodes
            //                     }
            //                 })
            //                 .then(async (val) => {
            //                     dataResponse = { "businessName": req.body.businessName, "fastCode": code, "status": "active" }
            //                     message = 'success'
            //                     console.log(val)
            //                 })
            //         }
            //     }

            //     else {
            //         console.log(req.body.businessName)
            //         let businessName = req.body.businessName
            //         let code = parseInt(Math.random() * (1000000 - 100000));
            //         let fastCodeObject = { "businessName": businessName, "fastCode": code, "status": "active" }
            //         //console.log("------------",req.body.businessName)            
            //         try {
            //             let new_record = new fastPaymentCode({
            //                 id: mongoose.Types.ObjectId(),
            //                 businessName: req.body.businessName,
            //                 merchantId: merchantKey,
            //                 fastCodes: fastCodeObject,
            //             })
            //             console.log(new_record)
            //             response = await new_record.save()
            //             message = "fast code created"
            //             status = 200

            //         }
            //         catch (error) {
            //             message = error
            //             status = 400
            //             dataResponse = 'null'
            //         }
            //     }
            // })}
            // else {message = "Store does not exist"
            //     status = 400
            //     dataResponse = 'null'}
            // })
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




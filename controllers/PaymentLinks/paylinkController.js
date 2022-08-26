const invoice = require('../../Models/invoice');
const paylinkPayment = require('../../Models/payLink');
const transaction = require("../transcationpoolController")
const fastPaymentCode = require('../../Models/fastPaymentCode');
const merchantStore = require('../../Models/merchantstore');
var mongoose = require('mongoose');
let message = ''
let status = ''
module.exports =
{
    async storeInvoice(req, res) {

        let invoiceObject = req.body
        let invoiceid = ''
        var merchantKey = req.headers.authorization
        try {
            let new_record = new invoice({
                id: mongoose.Types.ObjectId(),
                invoiceNumber: invoiceObject.invoiceNumber,
                merchantId: merchantKey,
                Items: invoiceObject.Items,
                apiKey: merchantKey,
                customerName: req.body.customerName,
                invoiceNumber: req.body.invoiceNumber,
                email: req.body.email,
                mobileNumber: req.body.mobileNumber,
                duedate: req.body.duedate,
                additionalNotes: req.body.additionalNotes,
                currency: req.body.currency,
                totalAmount: req.body.totalAmount,
                orderId: req.body.orderId,
                status: 'pending'
            })
            console.log(new_record)
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

    async getPaymentLink(req, res) {
        console.log("generate the payment link", req.headers.authorization)
        let responseObj = ''
        try {
            var merchantKey = req.headers.authorization
            let new_record = new paylinkPayment({
                id: mongoose.Types.ObjectId(),
                invoiceNumber: req.body.invoiceId,
                merchantId: merchantKey,
                apiKey: merchantKey,
                customerName: req.body.customerName,
                invoiceNumber: req.body.invoiceNumber,
                email: req.body.email,
                mobileNumber: req.body.mobileNumber,
                duedate: req.body.duedate,
                additionalNotes: req.body.additionalNotes,
                currency: req.body.currency,
                totalAmount: req.body.totalAmount,
                orderId: req.body.orderId,
                status: "pending"
            })
            console.log(new_record)
            let response = await new_record.save()
            responseObj = response.id
            message = "payment initiated"
            status = 200
            //transaction.assignMerchantWallet(req)
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
            let findResult = await invoice.find({
                merchantId: merchantKey,

            });
            response = findResult
        }
        catch (error) {
            response = "someting went wrong"
            status = 400
        }

        res.json({ status: status, data: response, message: "get all invoices" })

    },

    async verifyPaymentLink(req, res) {
        console.log("payment id", req.body.paymentId)
        let findResult = ''
        let response = []

        let status = 200;
        try {
            findResult = await paylinkPayment.find({
                id: req.body.paymentId,
            });
            console.log("invoice number", findResult)
            response.push(findResult)
            console.log(response)
            invoiceNumber = findResult[0].invoiceNumber
            console.log("invoice number", invoiceNumber)

        }
        catch (error) {
            response = "someting went wrong"
            status = 400
            response = error
        }
        try {
            if (invoiceNumber) {
                response = await invoice.find({
                    invoiceNumber: invoiceNumber
                });
                console.log("invoice", response)
            }
        }
        catch (error) {

        }
        res.json({ status: status, data: response, message: "verify invoice" })
    },


    // async createFastCode(req, res) {
    //     var merchantKey = req.headers.authorization
    //     let response = ''
        
    //     // let flag = await fastPaymentCode.findOne({merchatId : merchantKey}).then(async (val) => {
    //     // console.log("flag",flag,val)   
    //     // })         
    //     console.log(req.body.businessName)
    //     let businessName = req.body.businessName
    //     if(!businessName){
            
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
    //         }
    //     }
        
        
    //     res.json({ status: status, data: response, message: message })
    // },

    async verifyFastPayment(req, res) {
        console.log("verify", req.headers.authorization, req.body.businessName)
        let findResult = ''
        let response = []
        let status = 200;
        try {
            findResult = await fastPaymentCode.find({
                "fastCodes.businessName": req.body.businessName,
                "merchantId": req.headers.authorization
            })
            //console.log("fastCode number",findResult)
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
        let storeProfile = ''
        console.log("fastCode", req.body.fastCode)
        let findResult = ''
        let response = []
        let status = 200;
        try {
            findResult = await fastPaymentCode.find({
                "fastCodes.fastCode": req.body.fastCode
            })
            
            try{
                console.log(req.headers.authorization,findResult[0].fastCodes[0].businessName)
                storeProfile = await merchantStore.findOne({
                storename:findResult[0].fastCodes[0].businessName
            });
        }
        catch (error){

        }
            response = (findResult)
            console.log("result",storeProfile)
        }
        catch (error) {
            response = "someting went wrong"
            status = 400
            response = error
        }
        if (response == 0) status = 400
        //res.json({ status: status, data: {"data":response,"storeProfile":storeProfile}, message: "verify fast code" })
        res.json({ status: status, data: response,storeProfile, message: "verify fast code" })
    },

    async createFastCode(req, res) {
        let message = ''
        let status = 200
        let storeProfile = ''
        var merchantKey = req.headers.authorization
        let dataResponse = ''
        let fastCodeObject = []
        if(!req.body.businessName||req.body.businessName==''){
            console.log("no name")
            message = "Business name is missing"
            status = 400
            res.json({ status: status, data: dataResponse, message: message })
            return
        }
        try {
            await merchantStore.findOne({ "storename": req.body.businessName }).then(async (val) => {
            console.log("valueeeeeeeeee",val)
            if(val.clientapikey == req.headers.authorization ){          
            await fastPaymentCode.findOne({ "merchantId": merchantKey }).then(async (val) => {
                if (val) {
                    fastCodeObject = val
                    console.log("data........", fastCodeObject)
                    for (i = 0; i < fastCodeObject.fastCodes.length; i++) {
                        if (fastCodeObject.fastCodes[i].businessName == req.body.businessName) {
                            dataResponse = fastCodeObject.fastCodes[i]
                            console.log("data........", dataResponse)
                        }
                    }
                    if (dataResponse == 0) {
                        let code = parseInt(Math.random() * (1000000 - 100000));
                        fastCodeObject.fastCodes.push({ "businessName": req.body.businessName, "fastCode": code, "status": "active" })
                        console.log("Object is", fastCodeObject.fastCodes)
                        await fastPaymentCode.updateOne({ 'id': fastCodeObject.id },
                            {
                                $set:
                                {
                                    "fastCodes": fastCodeObject.fastCodes
                                }
                            })
                            .then(async (val) => {
                                dataResponse = { "businessName": req.body.businessName, "fastCode": code, "status": "active" }
                                message = 'success'
                                console.log(val)
                            })
                    }
                }

                else {
                    console.log(req.body.businessName)
                    let businessName = req.body.businessName
                    let code = parseInt(Math.random() * (1000000 - 100000));
                    let fastCodeObject = { "businessName": businessName, "fastCode": code, "status": "active" }
                    //console.log("------------",req.body.businessName)            
                    try {
                        let new_record = new fastPaymentCode({
                            id: mongoose.Types.ObjectId(),
                            businessName: req.body.businessName,
                            merchantId: merchantKey,
                            fastCodes: fastCodeObject,
                        })
                        console.log(new_record)
                        response = await new_record.save()
                        message = "fast code created"
                        status = 200

                    }
                    catch (error) {
                        message = error
                        status = 400
                        dataResponse = 'null'
                    }
                }
            })}
        
        else {message = "Store does not exist"
            status = 400
            dataResponse = 'null'}
        })
        }
        catch (error) {
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




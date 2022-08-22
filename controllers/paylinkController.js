const invoice = require('../Models/invoice');
const paylinkPayment = require('../Models/payLink');
const transaction = require("../controllers/transcationpoolController")
const fastPaymentCode = require ('../Models/fastPaymentCode');
var mongoose = require('mongoose');
let message = ''
let status = ''
module.exports =
{
    async storeInvoice(req, res) {
        
        let invoiceObject = req.body
        let invoiceid = ''
        var merchantKey  = req.headers.authorization
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
            let res = await new_record.save()
            invoiceid = res.id
            message= "Invoice created"
            status = 200
        }
        catch (error) {
            console.log("new invoice error", error)
            invoiceid = ''
            message = error
            status = 400
            return error
        }

        res.json({ status: status, data: { "invoiceid": invoiceid }, message: message })
    },

    async getPaymentLink(req, res) {
        console.log("generate the payment link",req.headers.authorization)
        let responseObj = ''
        try {
            
            var merchantKey  = req.headers.authorization
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
        var merchantKey  = req.headers.authorization
        let response = ''
        let invoiceNumber = ''
        let status = 200;
        try{
               let findResult = await invoice.find({
                merchantId: merchantKey,  
                
              });
              response = findResult
        }
        catch (error){
            response = "someting went wrong"
            status = 400
        }
        
          res.json({ status: status, data:response, message: "get all invoices" })
       
    },

    async verifyPaymentLink(req, res) {
        console.log("payment id",req.body.paymentId)
        let findResult= ''
        let response = []
        
        let status = 200;
            try{
            findResult = await paylinkPayment.find({
            id: req.body.paymentId,                          
           }); 
        console.log("invoice number",findResult)
        response.push(findResult)
        console.log(response)
        invoiceNumber = findResult[0].invoiceNumber
        console.log("invoice number",invoiceNumber)
         
     }
     catch (error){
         response = "someting went wrong"
         status = 400
         response = error
     }
     try{     
        if(invoiceNumber){
        response = await invoice.find({
        invoiceNumber : invoiceNumber
        });
        console.log("invoice",response)
     }
    }
     catch (error){
        
     }
     res.json({ status: status, data:response, message: "verify invoice" })        
    },

    
        async createFastCode(req, res) {        
            var merchantKey  = req.headers.authorization
            let response = ''
            console.log(req.body.businessName)
            let businessName = req.body.businessName
            let code = parseInt(Math.random() * (1000000 - 100000)) ;
            let fastCodeObject = {"businessName":businessName,"fastCode":code, "status":"active"}
            console.log(fastCodeObject)
            //fastPaymentCode.find({name:{$exists:true}})
            try {
                let new_record = new fastPaymentCode({
                    id: mongoose.Types.ObjectId(),
                    merchantId: merchantKey,
                    fastCodes: fastCodeObject,
                })
                console.log(new_record)
                response = await new_record.save()
                message= "fast code created"
                status = 200
            }
            catch (error) {
                
                message = error
                status = 400                
            }    
            res.json({ status: status, data:response, message: message })     
        },

        async verifyFastPayment(req, res) {
            console.log("fastCode",req.body.fastCode)
            let findResult= ''
            let response = []            
            let status = 200;
            try{
            findResult = await fastPaymentCode.find({
                fastCode: req.body.fastCode,                          
            }); 
            //findResult = fastPaymentCode.fastCodes.find({fastCodes:{$elemMatch:{fastCode : "599469"}}}).pretty();
            console.log("fastCode number",findResult)
            response.push(findResult)
            console.log(response)
            invoiceNumber = findResult[0].invoiceNumber
            console.log("invoice number",invoiceNumber)
             
         }
         catch (error){
             response = "someting went wrong"
             status = 400
             response = error
         }
         try{     
            if(invoiceNumber){
           
            response = await invoice.find({
            invoiceNumber : invoiceNumber
            });
            console.log("invoice",response)
         }
        }
         catch (error){
            
         }
         res.json({ status: status, data:response, message: "verify invoice" })        
        },
    }

      

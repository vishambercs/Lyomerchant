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
            let res = await new_record.save()
            invoiceid = res.id
            message = "Invoice created"
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


    async assignPaymentLinkMerchantWallet(req, res) {
        try {
            var merchantKey   = req.headers.authorization
            var networkType   = req.body.networkType
            var callbackURL   = req.body.callbackURL
            var securityHash  = req.body.securityHash
            var orderid       = req.body.orderid
            var security_hash = (merchantKey + networkType + callbackURL + process.env.BASE_WORD_FOR_HASH)
            var hash          = CryptoJS.MD5(security_hash).toString();
            let account       = await poolwalletController.getPoolWalletID(networkType) 
            if (hash == securityHash) 
            {
                let currentDateTemp = Date.now();
                let currentDate = parseInt((currentDateTemp / 1000).toFixed());
                const newRecord = new paymentLinkTransactionPool({
                    id: crypto.randomBytes(20).toString('hex'),
                    api_key: req.headers.authorization,
                    poolwalletID: account.id,
                    amount: req.body.amount,
                    currency: req.body.currency,
                    callbackURL: req.body.callbackURL,
                    orderid: req.body.orderid,
                    clientToken: req.body.token,
                    status: 0,
                    walletValidity: currentDate,
                    timestamps : new Date().getTime()
                });
                newRecord.save().then(async (val) => {
                    await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                    let data = { transactionID: val.id, address: account.address, walletValidity: val.walletValidity }
                    res.json({ status: 200, message: "POS Wallet Assigned Successfully", data: data })
                }).catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })
            }
            else 
            {
                res.json({ status: 400, data: {}, message: "Invalid Hash" })
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async getPaymentLinkTransList(req, res) {
        try {
          
           let searchParameters = { "api_key": req.headers.authorization}
           
           if( (req.body.networkid  != "" && req.body.networkid  != undefined) && (req.body.status  != "" && req.body.status  != undefined))
           {
            searchParameters    = { "api_key": req.headers.authorization, "poolWallet.network_id": req.body.networkid, "status": parseInt(req.body.status) }
           }   
           else if(req.body.networkid  != "" && req.body.networkid  != undefined )
           {
            searchParameters    = { "api_key": req.headers.authorization, "poolWallet.network_id": req.body.networkid }
           }   
           else if(req.body.status  != "" && req.body.status  != undefined )
           {
            searchParameters    = { "api_key": req.headers.authorization,"status": parseInt(req.body.status) }
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
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

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




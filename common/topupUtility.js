const ejs           = require('ejs');
const fs            = require('fs');
const Web3          = require('web3');
const axios         = require('axios')
var qs              = require('qs');
var stringify       = require('json-stringify-safe');
const transcationLog = require('../Models/transcationLog');
const network = require('../Models/network');
const Constant = require('./Constant');
const transferUtility = require('./transferUtility');
const Utility = require('./Utility');
const clientWallets = require('../Models/clientWallets');
const poolWallets = require('../Models/poolWallet');
const clients = require('../Models/clients');
const hotWallets = require('../Models/hotWallets');
const hot_wallet_trans_logs = require('../Models/hot_wallet_trans_logs');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const TronWeb = require('tronweb')
const posTransactionPool = require('../Models/posTransactionPool');
const paymentLinkTransactionPool = require('../Models/paymentLinkTransactionPool');
const transporter = nodemailer.createTransport({ host: "srv.lyotechlabs.com", port: 465, auth: { user: "no-reply@email.lyomerchant.com", pass: "1gbA=0pVVJcS", } });
const feedWalletController = require('../controllers/Masters/feedWalletController');
const transactionPools     = require('../Models/transactionPool');
const feedWallets          = require('../Models/feedWallets');
const payLink              = require('../Models/payLink');
const invoice              = require('../Models/invoice');
const IPNS                 = require('../Models/IPN');
const topup                = require('../Models/topup');
const emailSending         = require('./emailSending');

async function get_Transcation_topup(transkey,api_key) {

    let pooldata = await topup.aggregate(
        [
            { $match: { id: transkey, $or: [{ status: 0 }, { status: 2 }] } },
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
                    from: "clients", // collection to join
                    localField: "api_key",//field from the input documents
                    foreignField: "api_key",//field from the documents of the "from" collection
                    as: "clientdetails"// output array field
                }
            },
            {
                "$project":
                {
                    "poolWallet.privateKey": 0,
                    "poolWallet.id": 0,
                    "poolWallet._id": 0,
                    "poolWallet.status": 0,
                    "poolWallet.__v": 0,
                    "networkDetails.__v": 0,
                    "networkDetails.created_by": 0,
                    "networkDetails.createdAt": 0,
                    "networkDetails.updatedAt": 0,
                    "networkDetails._id": 0
                }
            }
        ])
    return pooldata
}

async function getTrasnsBalance(transdata) {
    try {
        let addressObject            = transdata[0]
        let response                 = {}
        let account_balance_in_ether = 0
        let token_balance            = 0
        let native_balance           = 0
        let format_token_balance     = 0
        let format_native_balance    = 0
        var amountstatus             = 0
        let merchantbalance          = 0;

        response = { amountstatus: 0,"paymentdata":0, status: 200, "data": 0, message: "Success" };
        return JSON.stringify(response)


        // if(addressObject.timestamps == null || addressObject.timestamps == undefined){
        //     response = { amountstatus: 0,"paymentdata":{}, status: 200, "data": {}, message: "Success" };
        //     return JSON.stringify(response)
        // }

        // const previousdate           = new Date(parseInt(addressObject.timestamps));
        // const currentdate            = new Date().getTime()
        // var diff = currentdate - previousdate.getTime();
        // var minutes = (diff / 60000)


        // console.log("previousdate   ================", previousdate)
        // console.log("currentdate    ================", currentdate)
        // console.log("minutes        ================", minutes)
        // let BalanceOfAddress = await CheckAddress(
        //     addressObject.networkDetails[0].nodeUrl,
        //     addressObject.networkDetails[0].libarayType,
        //     addressObject.poolWallet[0].address,
        //     addressObject.networkDetails[0].contractAddress,
        //     addressObject.poolWallet[0].privateKey
        // )
        

        // let remain       = parseFloat(addressObject.amount) - parseFloat(BalanceOfAddress.data.format_token_balance)
        // let paymentData  = { "remain":remain , "paid" :BalanceOfAddress.data.format_token_balance , "required" : addressObject.amount }

        // if (minutes > 180) 
        // {
        //     let transactionpool     = await paymentLinkTransactionPool.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 4 } })
        //     let poolwallet          = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { "status": 3 } })
        //     response                = { amountstatus: 4,"paymentdata":paymentData,status: 200, "data": {}, message: "Your Transcation is expired." };
        //     var emailTemplateName = 
        //     { 
        //         "emailTemplateName": "successtrans.ejs", 
        //         "to": addressObject.clientsdetails[0].email, 
        //         "subject": "LYOMERCHANT Expired Transaction", 
        //         "templateData": {
        //             "status": "Expired" ,
        //             "paymentdata":paymentData ,
        //             "transid": addressObject.id ,
        //             "invoicenumber" :addressObject.invoicedetails[0].invoiceNumber,
        //             "storename" :"",
        //             "network" :addressObject.networkDetails[0].network ,
        //             "coin" :addressObject.networkDetails[0].coin,
        //             "amount" :addressObject.amount 
        //     }}
           
        //     let email_response = await emailSending.emailLogs(addressObject.id,emailTemplateName)
        //     console.log("email_response Success",email_response)
        //     return JSON.stringify(response)
        // }
        // amountstatus    = await amountCheck(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(BalanceOfAddress.data.format_token_balance))
        // const hotWallet = await hotWallets.findOne({ "network_id": addressObject.networkDetails[0].id, "status": 1 })
       
        // let GasFee = await calculateGasFee
        //     (
        //         addressObject.networkDetails[0].nodeUrl, 
        //         addressObject.networkDetails[0].libarayType,
        //         addressObject.poolWallet[0].address,
        //         hotWallet.address,
        //         BalanceOfAddress.data.token_balance,
        //         addressObject.networkDetails[0].contractAddress)


               
        // if (amountstatus != 0) 
        // {
        //     let walletbalance = BalanceOfAddress.status == 200 ? BalanceOfAddress.data.format_token_balance : 0
            
        //     let transactionpool = await paymentLinkTransactionPool.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": amountstatus } })
           
        //     let logData = { "transcationDetails": [] }
        //     if (amountstatus == 1 || amountstatus == 3) 
        //     {
        //         let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, walletbalance)
        //         let previouspoolwallet = await poolWallets.findOne({ id: addressObject.poolWallet[0].id })
        //         if(previouspoolwallet != null)
        //         {
        //             let totalBalnce = parseFloat(previouspoolwallet.balance) + walletbalance
        //             let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { balance: totalBalnce } })
        //         }     
              
        //         if(addressObject.orderType != "fastCode")
        //        {
        //         let paylinkData = await payLink.findOneAndUpdate({ id: addressObject.payLinkId }, { $set: { status: amountstatus } })
        //         let invoiceData = await invoice.findOneAndUpdate({ id: paylinkData.invoice_id }, { $set: { status: amountstatus } })
                
        //         if(invoiceData != null )
        //         var emailTemplateName = 
        //         { 
        //             "emailTemplateName" : "paymentconfirmation.ejs", 
        //             "to"                :  invoiceData.email, 
        //             "subject"           : "LYOMERCHANT Success Transaction", 
        //             "templateData"      : 
        //             {
        //                 "status"        : "Success" ,
        //                 "transid"       : addressObject.id ,
        //                 "address"       : addressObject.poolWallet[0].address,
        //                 "network"       : addressObject.networkDetails[0].network ,
        //                 "coin"          : addressObject.networkDetails[0].coin,
        //                 "amount"        : addressObject.amount,
        //                 "orderid"       : invoiceData.invoiceNumber   
        //             }}
        //         let email_response = await emailSending.emailLogs(addressObject.id,emailTemplateName)
        //         console.log("email_response Success",email_response)
        //         }
        //         let poolwallet             = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { status: 4 } })
        //         let balanceTransfer        = addressObject.networkDetails[0].libarayType == "Web3" ? BalanceOfAddress.data.format_native_balance : BalanceOfAddress.data.token_balance 
        //         let hot_wallet_transcation = await transfer_amount_to_hot_wallet(addressObject.poolWallet[0].id, addressObject.id, balanceTransfer, BalanceOfAddress.data.native_balance,GasFee.data.fee)
                
        //         var emailTemplateName = 
        //         { 
        //             "emailTemplateName": "successtrans.ejs", 
        //             "to": addressObject.clientsdetails[0].email, 
        //             "subject": "LYOMERCHANT Success Transaction", 
        //             "templateData": {
        //                 "status": "Success" ,
        //                 "paymentdata":paymentData ,
        //                 "transid": addressObject.id ,
        //                 "invoicenumber" : addressObject.orderType =="fastCode" ?  ""  : addressObject.invoicedetails[0].invoiceNumber,
        //                 "storename" :"",
        //                 "network" :addressObject.networkDetails[0].network ,
        //                 "coin" :addressObject.networkDetails[0].coin,
        //                 "amount" :addressObject.amount 
        //         }}
        //         let email_response = await emailSending.emailLogs(addressObject.id,emailTemplateName)
        //         console.log("email_response Success",email_response)
        //         console.log("callIPN=======",addressObject.id)
        //         let IPNData =  await callIPN(addressObject.id) 
        //         console.log("IPNData=======",IPNData)
        //         response = { amountstatus: amountstatus, "paymentdata":paymentData,status: 200, "data": logData, message: "Success" };
        //         return JSON.stringify(response)
        //     }
        //     response = { amountstatus: amountstatus, "paymentdata":paymentData,status: 200, "data": logData, message: "Success" };
        //     return JSON.stringify(response)
        // }
        // else 
        // {
        //     let trans_data = await getTranscationDataForClient(addressObject.id, "POS")
        //     let logData = { "transcationDetails": trans_data.length > 0 ? trans_data[0] : {} }
        //     response = { amountstatus: amountstatus,"paymentdata":paymentData, status: 200, "data": logData, message: "Success" };
        //     return JSON.stringify(response)
        // }

        
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        respone = { status: 400, data: {}, message: "Please Contact Admin" }
        return JSON.stringify(respone)
    }
}
module.exports =
{
    get_Transcation_topup : get_Transcation_topup,
    getTrasnsBalance      : getTrasnsBalance   
}









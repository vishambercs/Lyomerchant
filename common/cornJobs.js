const address = []
const block = 0
const index = 0
const commonFunction            = require("./commonFunction")
const constant                  = require("./Constant")
const axios                     = require('axios')
const clientsController         = require("../controllers/clientsController")
const hw_trans_logs             = require("../controllers/hotwallettranslogsController")
const feedWalletController      = require("../controllers/Masters/feedWalletController")
const hotWalletTransLogs        = require('../Models/hot_wallet_trans_logs');
const poolWallets               = require('../Models/poolWallet');
const HotTransLogs              = require('../Models/HotTransLogs');
const withDrawLog               = require('../Models/withdrawLog');
const network                   = require('../Models/network');
const kytlogs                   = require('../Models/kytlogs');
const transferUtility = require('../common/transferUtility');
const emailSending = require('../common/emailSending');
var mongoose = require('mongoose');
var qs = require('qs');

require("dotenv").config()

async function transfer_from_pw_to_hw(nodeUrl, libarayType, fromaddress, toaddress, contractAddress, privateKey, balance) {
    try {
        let gasfee = await transferUtility.calculateGasFee
            (
                nodeUrl,
                libarayType,
                fromaddress,
                toaddress,
                balance,
                contractAddress
            )
        console.log("=======gasfee=======", gasfee)
        if (gasfee.status == 400) {
            return { status: 400, data: gasfee, message: "There is an error in calculating gas fee" }
        }
        if (libarayType == "Tronweb") {
            let transfertoken = await transferUtility.transfertokenTronWeb
                (
                    nodeUrl,
                    contractAddress,
                    fromaddress,
                    privateKey,
                    toaddress,
                    balance,

                )
            return transfertoken
        }
        else {
            console.log("=======gasfee=======", gasfee)
            let transfertoken = await transferUtility.transfertokenWeb3
                (
                    nodeUrl,
                    contractAddress,
                    fromaddress,
                    privateKey,
                    toaddress,
                    balance,
                    gasfee.data.gasamount,
                )
            console.log("=======transfertokenWeb3=======", transfertoken)
            return transfertoken
        }
    }
    catch (error) {
        console.log(error)
        return { status: 400, data: {}, message: error.message }
    }
}

async function Hot_Trans_Log_save(id, status, trans_id) {
    const HotTransLog = new HotTransLogs({
        id: mongoose.Types.ObjectId(),
        feeding_trans_id: id,
        trans_id: status == 200 ? trans_id : "Not Feeded",
        created_by: "cron-job",
        created_at: new Date().toString(),
        type: "Corn Job Feeding Wallet to Pool wallet"
    });
    let logs = await HotTransLog.save()
    return logs;
}

async function saved_Trans(id, status, remarks,poolwalletid,pooldata,address_balance) {
    let hotWalletTransLog = await hotWalletTransLogs.updateOne({ id: id },
        {
            $set:
            {
                status: status ,
                verified_by: "Corn-Job",
                verified_at: new Date().toString(),
                remarks: remarks,
            }
        },
        { $new: true }
    )
   
    let poolwallet = await poolWallets.findOneAndUpdate({ id: poolwalletid }, { $set: { status: 0, balance: 0 } })
    let WEB = pooldata[0].transactionPoolsDetails.length > 0  ? "WEB" : ""
    let POS = pooldata[0].postransactionpoolsDetails.length > 0  ? "POS" : "" 
    let PAY_LINK = pooldata[0].paymentlinkDetails.length > 0  ? "PAY-LINK" : "" 
    let transdetails = process.env.EMAIL_TYPE + (WEB+""+ POS +""+PAY_LINK) +" : "+pooldata[0].merchant_trans_id

    var emailTemplateName =
    {
        "emailTemplateName" :   "transcationpwtohw.ejs",
        "to"                :   process.env.FEEDING_EMAIL_REMINDER,
        "subject"           :   "Confirmation of Transcation From Pool Wallet To Hot Wallet",
        "templateData": 
        { 
        "transdetails"  :  transdetails ,
        "pooladdress"   :  pooldata[0].poolwalletsDetails[0].address,
        "hotaddress"    :  pooldata[0].hotwalletsDetails[0].address,
        "network"       :  pooldata[0].networkDetails[0].coin +"(" + pooldata[0].networkDetails[0].network +")",
        "amount"        :  constant.addressBalance.data.format_token_balance 
       }
    }
        constant.transid = ""
        constant.addressBalance = [];
      let email_response = await emailSending.sendEmailFunc(emailTemplateName)
     
}

async function update_orphane(id, status, remarks,pooldata) {
    let hotWalletTransLog = await hotWalletTransLogs.updateOne({ id: id },
        {
            $set:
            {
                status: status,
                remarks: remarks,
            }
        },
        { $new: true }
    )
    // let type = pooldata[0].transactionPoolsDetails.length > 0  ? "WEB" : ""
    // type = pooldata[0].postransactionpoolsDetails.length > 0  ? "POS" : "" 
    // type = pooldata[0].paymentlinkDetails.length > 0  ? "PAY-LINK" : "" 
    // let transdetails = " Live :"+pooldata[0].merchant_trans_id
    // var emailTemplateName =
    // {
    //     "emailTemplateName": "transcationpwtohw.ejs",
    //     "to": process.env.FEEDING_EMAIL_REMINDER,
    //     "subject": "Confirmation of Transcation From Pool Wallet To Hot Wallet",
    //     "templateData": 
    //     { 
    //     "transdetails"  :  transdetails ,
    //     "pooladdress"   :  "Please Do Manually because old transcation",
    //     "hotaddress"    :   "Please Do Manually because old transcation",
    //     "network"       :  "Please Do Manually because old transcation",
    //     "amount"        :   "Please Do Manually because old transcation" 
    //    }
    // }
    //   constant.transid = ""
    //   constant.addressBalance = [];
    //   let email_response = await emailSending.sendEmailFunc(emailTemplateName)
     
}

async function Balance_Cron_Job() {
    try {
        
        let transid = ""
        let hot_wallet_trans_log = await hotWalletTransLogs.findOne({
            $or: [
                { status: 1  },
                { status: 5  },
                { status: 6  },
                { status: 12 },
                { status: 11 },
                { status: 14 },
            ]
        })
        const statusArray = [6, 1, 5, 12, 11, 14]

       

        if (constant.transid == "" && hot_wallet_trans_log == null) {
            return JSON.stringify({ status: 400, data: {}, message: "No Any Transcation For transfering" })
        }
        if (hot_wallet_trans_log == null) 
        {
            return JSON.stringify({ status: 400, data: {}, message: "Please Check For The Transcation" })
        }
        constant.transid = (constant.transid == "") ? hot_wallet_trans_log.id : constant.transid
        transid = constant.transid
        let pooldata = await hw_trans_logs.get_HW_Translogs_byID(hot_wallet_trans_log.id)
       

        if (pooldata[0].poolwalletsDetails[0] == undefined) {
            let remarks = pooldata[0].remarks;
            
            let remarksData = await transferUtility.push_The_Remarks(remarks, "Please Do manually", "Balance_Cron_Job")
            await update_orphane(pooldata[0].id, 4, remarksData.data,pooldata)
            return JSON.stringify({ status: 400, data: transid, message: "Invalid Trans" })
        }
        
        
        let address_balance = await feedWalletController.CheckBalanceOfAddress(
            pooldata[0].networkDetails[0].nodeUrl,
            pooldata[0].networkDetails[0].libarayType,
            pooldata[0].poolwalletsDetails[0].address,
            pooldata[0].networkDetails[0].contractAddress,
            pooldata[0].poolwalletsDetails[0].privateKey
        )


        constant.addressBalance = constant.addressBalance.length == 0 ? address_balance : constant.addressBalance
        let trans_status = parseInt(pooldata[0].status)
       

        if (address_balance.status == 200 &&  parseFloat(address_balance.data.format_token_balance) == 0) {
            let remarks = pooldata[0].remarks;
            let remarksData = await transferUtility.push_The_Remarks(remarks, "Previous Trans", "Balance_Cron_Job")
            await saved_Trans(pooldata[0].id, 10, remarksData.data,pooldata[0].poolwalletsDetails[0].id,pooldata,address_balance)
            return JSON.stringify({ status: 400, data: transid, message: "Invalid Trans" })
        }
        if (statusArray.indexOf(trans_status) == -1) {
            return JSON.stringify({ status: 400, data: transid, message: "Invalid Trans" })
        }
        else if (trans_status == 5 || trans_status == 1 || trans_status == 6) {


            let transfer_from_pw_to_hw_data = await transfer_from_pw_to_hw(
                pooldata[0].networkDetails[0].nodeUrl,
                pooldata[0].networkDetails[0].libarayType,
                pooldata[0].poolwalletsDetails[0].address,
                pooldata[0].hotwalletsDetails[0].address,
                pooldata[0].networkDetails[0].contractAddress,
                pooldata[0].poolwalletsDetails[0].privateKey,
                address_balance.data.token_balance
            )

            let remarks = pooldata[0].remarks;
            let remarksData = await transferUtility.push_The_Remarks(remarks, JSON.stringify(transfer_from_pw_to_hw_data), "transfer_from_pw_to_hw_data Balance_Cron_Job")
            let hotWalletTransLog = await hotWalletTransLogs.findOneAndUpdate({ id: pooldata[0].id },
                {
                    $set:
                    {
                        status: transfer_from_pw_to_hw_data.status == 200 ? 14 : 12,
                        trans_id: transfer_from_pw_to_hw_data.status == 200 ? transfer_from_pw_to_hw_data.data : " ",
                        remarks: remarksData.data,
                    }
                },
                { $new: true }
            )
            let dataValues = { "type": "transfer_from_pw_to_hw", "type": {}, "status": trans_status }
            return JSON.stringify({ status: 200, data: dataValues, message: "transfer_from_pw_to_hw_data" })
        }
        else if (trans_status == 11) {
            let data = await transferUtility.check_Status_Feeding_Transcation(
                pooldata[0].networkDetails[0].nodeUrl,
                pooldata[0].networkDetails[0].libarayType,
                pooldata[0].poolwalletsDetails[0].privateKey,
                pooldata[0].feeding_trans_id
            )
            console.log("data", data)
            if (data.data == "SUCCESS") {
                let remarks = pooldata[0].remarks;
                let remarksData = await transferUtility.push_The_Remarks(remarks, "Feeding Trans Is Verfied By Corn Job", "Balance_Cron_Job")
                let hotWalletTransLog = await hotWalletTransLogs.updateOne({ id: pooldata[0].id },
                    {
                        $set:
                        {
                            status: data.status == 200 ? 5 : pooldata[0].status,
                            remarks: remarksData.data,
                        }
                    },
                    { $new: true }
                )
                let dataValues = { "type": "check_Status_Feeding_Transcation", "type": data.data, "status": trans_status }
                return JSON.stringify({ status: 200, data: dataValues, message: "Transfer From Pool Wallet to Hot Wallet" })
            }
            else {
                let dataValues = { "type": "check_Status_Feeding_Transcation", "type": data.data, "status": trans_status }
                return JSON.stringify({ status: 200, data: dataValues, message: "Transfer From Pool Wallet to Hot Wallet" })
            }
        }
        else if (trans_status == 12) {



            let gasfee = await transferUtility.calculateGasFee
                (
                    pooldata[0].networkDetails[0].nodeUrl,
                    pooldata[0].networkDetails[0].libarayType,
                    pooldata[0].poolwalletsDetails[0].address,
                    pooldata[0].hotwalletsDetails[0].address,
                    address_balance.data.token_balance,
                    pooldata[0].networkDetails[0].contractAddress,
                )

            let native_balance = pooldata[0].networkDetails[0].libarayType == "Tronweb" ? 10 : gasfee.data.fee
            let addressFeedingResponse = await feedWalletController.addressFeedingFun(
                pooldata[0].networkDetails[0].id,
                pooldata[0].poolwalletsDetails[0].address,
                native_balance)

            let remarks = pooldata[0].remarks;
            let remarksData = await transferUtility.push_The_Remarks(remarks, JSON.stringify(addressFeedingResponse), "addressFeedingResponse Balance_Cron_Job")
            let hotWalletTransLog = await hotWalletTransLogs.updateOne({ id: pooldata[0].id },
                {
                    $set:
                    {
                        status: addressFeedingResponse.status == 200 ? 11 : pooldata[0].status,
                        feeding_trans_id: addressFeedingResponse.status == 200 ? addressFeedingResponse.data.trans_id : "",
                        feeding_wallet_id: addressFeedingResponse.status == 200 ? addressFeedingResponse.data.feeding_wallet_id : "",
                        remarks: remarksData.data,
                    }
                },
                { $new: true }
            )
            let hottrasnlogs = await Hot_Trans_Log_save(constant.transid, addressFeedingResponse.status, constant.transid)
            let dataValues = { "type": "addressFeedingFun", "type": "", "status": trans_status }
            return JSON.stringify({ status: 200, data: dataValues, message: "addressFeedingResponse" })
        }
        else if (trans_status == 14) {
            let data = await transferUtility.check_Status_Feeding_Transcation(
                pooldata[0].networkDetails[0].nodeUrl,
                pooldata[0].networkDetails[0].libarayType,
                pooldata[0].poolwalletsDetails[0].privateKey,
                pooldata[0].trans_id
            )
            if (data.data == "OUT_OF_ENERGY") {
                let remarks = pooldata[0].remarks;
                let remarksData = await transferUtility.push_The_Remarks(remarks, "OUT_OF_ENERGY FROM PW TO HW", "Balance_Cron_Job")
                let hotWalletTransLog = await hotWalletTransLogs.updateOne({ id: pooldata[0].id },
                    {
                        $set:
                        {
                            status: data.status == 200 ? 12 : pooldata[0].status,
                            remarks: remarksData.data,
                        }
                    },
                    { $new: true }
                )
                let dataValues = { "type": "check_Status_Feeding_Transcation", "type": data.data, "status": trans_status }
                return JSON.stringify({ status: 200, data: dataValues, message: "Transfer From Pool Wallet to Hot Wallet" })
            }
            else if (data.data == "SUCCESS") 
            {
                let remarks = pooldata[0].remarks;
                let remarksData = await transferUtility.push_The_Remarks(remarks, "Verfied By Corn Job", "Balance_Cron_Job")
                await saved_Trans(pooldata[0].id, data.status, remarksData.data,pooldata[0].poolwalletsDetails[0].id,pooldata,address_balance)
                let dataValues = { "type": "check_Status_Feeding_Transcation", "type": data.data, "status": trans_status }
                constant.transid = ""
                return JSON.stringify({ status: 200, data: dataValues, message: "Transfer From Pool Wallet to Hot Wallet" })
            }
            else {
                let dataValues = { "type": "check_Status_Feeding_Transcation", "type": data.data, "status": trans_status }
                return JSON.stringify({ status: 200, data: dataValues, message: "Transfer From Pool Wallet to Hot Wallet" })
            }
        }
        else {


            return JSON.stringify({ status: 200, data: {}, message: constant.transid })

        }

    }
    catch (error) {
        console.log(error)
        return JSON.stringify({ status: 400, data: {}, message: error.message })
    }
}

async function Check_KYT_Address() 
{
    try 
    {
        let withdraw_data = await withDrawLog.findOne({ queue_type : 0 })
       
        if(withdraw_data == null)
        {
            
            let withdrawdata = await withDrawLog.updateMany({ queue_type : 1 }, { $set: { queue_type  :  0 }})
            return JSON.stringify({ status: 200, data: "No KYT Remaining", message: ""})
        }
        console.log(withdraw_data.timestamps ,withdraw_data.id)
        if(withdraw_data.timestamps == undefined)
        {
            let withdrawdata = await withDrawLog.findOneAndUpdate({ id : withdraw_data.id }, { $set: { timestamps  :  new Date().getTime() }},{ returnDocument: 'after' })
        }
       
        let kycurl    = process.env.KYC_URL + process.env.KYT_URL_ALERTS.replace("id", withdraw_data.external_id)
        let response  = await axios({ method: 'get', url: kycurl, headers: { 'Authorization': process.env.KYC_URL_TOKEN ,}})
        let status    = Object.keys(response.data.body).length > 0 ? 2 : 1
        let kytlog    = await kytlogs.insertMany([{
            status      : status,
            id          : mongoose.Types.ObjectId(), 
            logs        : JSON.stringify(response.data.body), 
            withdraw_id : withdraw_data.id,
            type        : "alerts"
        }])
        const previousdate = new Date(parseInt(withdraw_data.timestamps));
        const currentdate = new Date().getTime()
        var diff = currentdate - previousdate.getTime();
        var minutes = (diff / 60000)
        if(minutes >= 3600 && status == 1)
        {
            status = 3
        }
            
        let withdrawdata = await withDrawLog.findOneAndUpdate({ id : withdraw_data.id }, { $set: { status : status , queue_type  :  status }},{ returnDocument: 'after' })
        return JSON.stringify({ status: 200, data: response.data.body, message: ""})
    }
    catch (error) 
    {
        console.log(error)
        return JSON.stringify({ status: 400, data: error.body, message: error.message  })
    }
}

module.exports =
{
    address: address,
    block: block,
    index: index,
    Balance_Cron_Job    :   Balance_Cron_Job,
    Check_KYT_Address   :   Check_KYT_Address,
}
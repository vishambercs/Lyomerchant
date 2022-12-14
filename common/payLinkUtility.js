const ejs = require('ejs');
const fs = require('fs');
const Web3 = require('web3');
const axios = require('axios')
var qs = require('qs');


var stringify = require('json-stringify-safe');
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
const transactionPools = require('../Models/transactionPool');
const feedWallets = require('../Models/feedWallets');
const payLink = require('../Models/payLink');
const invoice = require('../Models/invoice');
const IPNS = require('../Models/IPN');
const emailSending = require('./emailSending');
const isEmpty = require('../Validation/isEmpty');

async function amountCheck(previous, need, current) {
    var net_amount = current - previous
    if (net_amount > 0 && net_amount == need) {
        return 1
    }
    else if (net_amount > 0 && net_amount < need) {
        return 2
    }
    else if (net_amount > 0 && net_amount > need) {
        return 3
    }
    else {
        return 0
    }
}

async function getTranscationDataForClient(transkey, type) {
    let pooldata = []
    if (type == "POS") {
        pooldata = await paymentLinkTransactionPool.aggregate(
            [
                { $match: { id: transkey } },
                {
                    $lookup: {
                        from: "transcationlogs", // collection to join
                        localField: "id",//field from the input documents
                        foreignField: "trans_pool_id",//field from the documents of the "from" collection
                        as: "transcationlogsDetails"// output array field
                    }
                },

            ])
        return pooldata
    }
    else {
        return pooldata
    }
}

async function updateClientWallet(client_api_key, networkid, merchantbalance, processingfee = 0.01) {
    
    let val = await clientWallets.findOne({ client_api_key: client_api_key, network_id: networkid })
    if (val != null) {
        let clientWallet = await clientWallets.updateOne({ client_api_key: client_api_key, network_id: networkid }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * processingfee))) } })
        return clientWallet
    }
    else {
        const clientWallet = new clientWallets({
            id: mongoose.Types.ObjectId(),
            client_api_key: client_api_key,
            address: " ",
            privatekey: " ",
            status: 3,
            network_id: networkid,
            balance: (merchantbalance - (merchantbalance * processingfee)),
            remarks: "Please Generate The Wallet Address Of this type"
        });
        let client_Wallet = await clientWallet.save()
        return client_Wallet
    }
}



async function Save_Trans_logs(feeding_wallet_id = "", feeding_trans_id = "", merchant_trans_id, poolwalletID, walletNetwork, hot_wallet_id, trans_id, feeLimit, remarksData, status) {
    let data_logs = await hot_wallet_trans_logs.findOne({ merchant_trans_id: merchant_trans_id })
      let logs = ""
      if (data_logs == null) {
          const hot_wallet_trans_log = new hot_wallet_trans_logs({
              id: mongoose.Types.ObjectId(),
              merchant_trans_id: merchant_trans_id,
              pool_wallet_id: poolwalletID,
              network_id: walletNetwork,
              hot_wallet_id: hot_wallet_id,
              trans_id: trans_id,
              feeding_wallet_id: feeding_wallet_id,
              feeding_trans_id: feeding_trans_id,
              feeLimit: feeLimit,
              remarks: remarksData,
              status: status
          });
          logs = await hot_wallet_trans_log.save()
      }
      else {
          logs = await hot_wallet_trans_logs.findOne({ id: data_logs.id },
              {
                  $set:
                  {
                      merchant_trans_id: merchant_trans_id,
                      pool_wallet_id: poolwalletID,
                      network_id: walletNetwork,
                      hot_wallet_id: hot_wallet_id,
                      trans_id: trans_id,
                      feeding_wallet_id: feeding_wallet_id,
                      feeding_trans_id: feeding_trans_id,
                      feeLimit: feeLimit,
                      remarks: remarksData,
                      status: status
                  }
              },
              { $new: true }
          )
      }
      return logs
}

async function transfer_amount_to_hot_wallet(poolwalletID, merchant_trans_id, account_balance, native_balance,feeLimit) {
    try {
        
        const from_wallet = await poolWallets.aggregate([
            { $match: { "id": poolwalletID } },
            { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "walletNetwork" } },
        ])
        const hotWallet = await hotWallets.findOne({ "network_id": from_wallet[0].network_id, "status": 1 })
        
        if (hotWallet == null)
        {
            let message =  "Please Add hot wallets" 
            var dateTime = new Date();
            let remarksData = JSON.stringify([{"message": message , "timestamp" : dateTime.toString() ,"method" : "hotWallet Wallet Null" }]) 
            const hot_wallet_trans_log = new hot_wallet_trans_logs({
            id                  : mongoose.Types.ObjectId(),
            merchant_trans_id   : merchant_trans_id,
            pool_wallet_id      : poolwalletID,
            network_id          : from_wallet[0].walletNetwork[0].id,   
            hot_wallet_id       : " ",
            trans_id            :  " ",
            feeLimit  : feeLimit,
            remarks: remarksData,
            status : 4
        });
        let logs = await hot_wallet_trans_log.save()    
        
        return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })  
        }
        let poolwallet = await poolWallets.findOneAndUpdate({ id: poolwalletID }, { $set: { status: 4 } })
        var dateTime = new Date();
        let remarksData = JSON.stringify([{ "message": "We are sending", "timestamp": dateTime.toString(), "method": "payLinkUtility transfer_amount_to_hot_wallet" }])
        let feedinglimitPerce = (from_wallet[0].walletNetwork[0].feedinglimitPerce == undefined || from_wallet[0].walletNetwork[0].feedinglimitPerce == "") ? 0.1 : from_wallet[0].walletNetwork[0].feedinglimitPerce
        let totalsend = parseFloat(feeLimit) + (parseFloat(account_balance) * parseFloat(feedinglimitPerce))
        let logs = await Save_Trans_logs("", "",merchant_trans_id, poolwalletID, from_wallet[0].walletNetwork[0].id, hotWallet.id, "", feeLimit, remarksData, 5)
        return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })
       
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        respone = { status : 400, data:{}, message : error.message }
        return JSON.stringify(respone)
    }
}
async function getTranscationDataForClient(transkey) {

    let pooldata = await transactionPools.aggregate(
        [
            { $match: { id: transkey } },
            {
                $lookup: {
                    from: "transcationlogs", // collection to join
                    localField: "id",//field from the input documents
                    foreignField: "trans_pool_id",//field from the documents of the "from" collection
                    as: "transcationlogsDetails"// output array field
                }
            },

        ])
    return pooldata
}
async function getTranscationList(address, trans_id, network_id) {
    response = {}
    let network_details = await network.findOne({ id: network_id })
    var URL = network_details.transcationurl
    if (network_details.cointype == "Token") {
        URL += "?module=account&action=tokentx&address=" + address;
        URL += "&contractaddress=" + network_details.contractAddress;
        URL += "&startblock=" + network_details.latest_block_number
        URL += "&endblock=" + "latest"
        URL += "&sort=" + "desc"
        URL += "&apikey=" + network_details.apiKey
    }
    else {
        URL += "?module=account&action=txlist&address=" + address;
        URL += "&startblock=" + network_details.latest_block_number
        URL += "&endblock=" + "latest"
        URL += "&sort=" + "desc"
        URL += "&apikey=" + network_details.apiKey
    }
    await axios.get(URL, {
        params: {},
        headers: {}
    }).then(async (res) => {
        var stringify_response = stringify(res)
     
        if (res.data.result.length > 0) {
            console.log("Inside IF", res.data.result.length)
            res.data.result.forEach(async (element) => {
                let transcationLogData = await transcationLog.findOne({ hash: element['hash'] })
                if (transcationLogData == null) {
                    element["amount"] = await Web3.utils.fromWei(element["value"], 'ether')
                    element["scanurl"] = network_details.scanurl + element["hash"]
                    element["trans_pool_id"] = trans_id
                    console.log("Error   =", element)
                    let transcationLogs = await transcationLog.insertMany(element)
                    let network_update = await network.updateOne({ id: network_id }, { $set: { latest_block_number: element["blockNumber"] } })
                }
            });
        }
        response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
    }).catch(error => {
        console.log("error   ====", error)
        var stringify_response = stringify(error)
        response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
    })
    return response;
}
async function postRequest(URL, parameters, headers) {
    let response = {}
    await axios.post(URL,
        qs.stringify(parameters),
        { headers: headers })
        .then(res => {
            var stringify_response = stringify(res)

            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        })
        .catch(error => {
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
    return response;


}
async function calculateGasFee(Nodeurl, Type, fromAddress, toAddress, amount, ContractAddress = "") {
    let gasAmount = 0
    let gasPrice = 0
    try {
       
        if (Type == "Web3") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            gasPrice = await WEB3.eth.getGasPrice();
            if (!isEmpty(ContractAddress)) 
            {
                const contract = new WEB3.eth.Contract(Constant.GAS_ABI, ContractAddress);
                gasAmount = await contract.methods.transfer(toAddress,  amount).estimateGas({ from: fromAddress });
                let feeformat = (gasPrice * gasAmount)
                let format_feeformat = await Web3.utils.fromWei(feeformat.toString(), 'ether')
                return { status: 200, data: { "fee": format_feeformat, "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
            }
            else 
            {
                gasAmount = await WEB3.eth.estimateGas({ to: toAddress, from: fromAddress, value: Web3.utils.toWei(`${amount}`, 'ether'), });
                let feeformat = (gasPrice * gasAmount)
                let format_feeformat = await Web3.utils.fromWei(feeformat.toString(), 'ether')
                return { status: 200, data: { "fee": format_feeformat, "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
            }
        }
        else {
            return { status: 200, data: { "fee": "2000000", "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
        }
    }
    catch (error) {
        console.log("calculateGasFee",error)
        return { status: 400, data: { "fee": 0, "gasprice": 0, "gasamount": 0 }, message: "Error" }
    }
}
async function CheckAddress(Nodeurl, Type, Address, ContractAddress = "", privateKey = "") {
    console.log(Address, Address.toLowerCase(), ContractAddress);
    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {
        if (Type == "Web3") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            
            if (!isEmpty(ContractAddress)) 
            {
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
                token_balance = await contract.methods.balanceOf(Address.toLowerCase()).call();
                let decimals = await contract.methods.decimals().call();
                format_token_balance = token_balance / (1 * 10 ** decimals)
                
            }
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')

            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else {
            const HttpProvider = TronWeb.providers.HttpProvider;
            const fullNode = new HttpProvider(Nodeurl);
            const solidityNode = new HttpProvider(Nodeurl);
            const eventServer = new HttpProvider(Nodeurl);
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            let contract = await tronWeb.contract().at(ContractAddress);
            native_balance = await tronWeb.trx.getBalance(Address)
            token_balance = await contract.balanceOf(Address).call();

            format_token_balance = tronWeb.toBigNumber(token_balance)
            format_token_balance = tronWeb.toDecimal(format_token_balance)
            format_token_balance = tronWeb.fromSun(format_token_balance)
            format_native_balance = tronWeb.toBigNumber(native_balance)
            format_native_balance = tronWeb.toDecimal(format_native_balance)
            format_native_balance = tronWeb.fromSun(format_native_balance)
            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        // let balanceData = { "token_balance": 0, "format_token_balance": 0, "native_balance": 0, "format_native_balance": 0 }
        // return { status: 400, data: balanceData, message: "Error" }
    }
    catch (error) {
        console.log(error)
        let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
        return { status: 400, data: balanceData, message: "Error" }
    }
}

async function get_Transcation_Paylink_Data(transkey) {

    let pooldata = await paymentLinkTransactionPool.aggregate(
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
                    from: "transcationlogs", // collection to join
                    localField: "id",//field from the input documents
                    foreignField: "trans_pool_id",//field from the documents of the "from" collection
                    as: "transcationlogsDetails"// output array field
                }
            },
            {
                $lookup: 
                {
                    from: "paylinkpayments", // collection to join
                    localField: "payLinkId",//field from the input documents
                    foreignField: "id",//field from the documents of the "from" collection
                    as: "paylinkdetails"// output array field
                }
            },
            {
                $lookup: 
                {
                    from: "invoices", // collection to join
                    localField: "paylinkdetails.invoice_id",//field from the input documents
                    foreignField: "id",//field from the documents of the "from" collection
                    as: "invoicedetails"// output array field
                }
            },
            {
                $lookup: 
                {
                    from: "clients", // collection to join
                    localField: "api_key",//field from the input documents
                    foreignField: "api_key",//field from the documents of the "from" collection
                    as: "clientsdetails"// output array field
                }
            },
            {
                "$project":
                {
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

async function callIPN(transkey) {
    let id           = transkey;
    
    let pyTranPool   = await paymentLinkTransactionPool.findOne({ "id": transkey })
    if(pyTranPool ==  null)
    {
        return { status: 400, message: "Not Found" }
    }
    let poolwallet     = await poolWallets.findOne({ id: pyTranPool.poolwalletID }) 
    let networkDetails =  await network.findOne({ id: poolwallet.network_id}) 
    let status         =   Constant.transstatus.filter(index => index.id == pyTranPool.status) 
    let amount         = pyTranPool.amount 
    let currency       = pyTranPool.currency 
    let apikey         =  pyTranPool.api_key 
    console.log("transkey", "transkey=============",transkey,pyTranPool.payLinkId)
    
    let payLink_data =  await payLink.findOne({ id: pyTranPool.payLinkId}) 
    console.log("transkey", "payLink_data=============",payLink_data)
    let invoice_data = null
    if(payLink_data != null){
     invoice_data =  await invoice.findOne({ id: payLink_data.invoice_id}) 
    }
    let datarray = 
    {
        "transaction_status"    : (status.length > 0 ? status[0].title : ""),
        "transaction_id"        : transkey,
        "address"               : (poolwallet != null ? poolwallet.address : ""),
        "coin"                  : (networkDetails != null ? networkDetails.coin : ""),
        "network"               : (networkDetails != null ? networkDetails.network : ""),
        "crypto_amount"         :  amount,
        "invoicenumber"         :  (invoice_data != null ) ? invoice_data.invoiceNumber : "" ,
        "fiat_amount"           :  (invoice_data != null ) ? invoice_data.totalAmount : "" ,
        "currency"              : currency   
        
    }
    let IPN = await IPNS.findOne({ client_api_key: apikey,status: 1 } )
    console.log("IPN IPN================",IPN);
    if(IPN != null){
        var data = qs.stringify( datarray);
            var config = {
              method: 'post',
              url: IPN.ipn_url,
              headers: { 
                'Authorization': IPN.client_api_token, 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              data : data
            };
            
            await axios(config) .then(function (response) {
              console.log("Success IPN================",JSON.stringify(response.data));
            })
            .catch(function (error) {


              console.log("Error IPN================",error);
            });
          return   { status: 200, message: "Success" }
            
    }
    else{
        return   { status: 400, message: "Not Found" }
    }

 
}

module.exports =
{
    get_Transcation_Paylink_Data : get_Transcation_Paylink_Data,
    async getTrasnsBalance(transdata) {
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

            if(addressObject.timestamps == null || addressObject.timestamps == undefined){
                response = { amountstatus: 0,"paymentdata":{}, status: 200, "data": {}, message: "Success" };
                return JSON.stringify(response)
            }

            const previousdate           = new Date(parseInt(addressObject.timestamps));
            const currentdate            = new Date().getTime()
            var diff = currentdate - previousdate.getTime();
            var minutes = (diff / 60000)


            console.log("previousdate   ================", previousdate)
            console.log("currentdate    ================", currentdate)
            console.log("minutes        ================", minutes)
            let BalanceOfAddress = await CheckAddress(
                addressObject.networkDetails[0].nodeUrl,
                addressObject.networkDetails[0].libarayType,
                addressObject.poolWallet[0].address,
                addressObject.networkDetails[0].contractAddress,
                addressObject.poolWallet[0].privateKey
            )
            console.log("BalanceOfAddress libarayType", addressObject.networkDetails[0].libarayType)
            console.log("BalanceOfAddress Success",     BalanceOfAddress)

            let remain       = parseFloat(addressObject.amount) - parseFloat(BalanceOfAddress.data.format_token_balance)
            let paymentData  = { 
                "remain":remain , 
                "paid" : parseFloat(BalanceOfAddress.data.format_token_balance) > 0 ? BalanceOfAddress.data.format_token_balance : BalanceOfAddress.data.format_native_balance , 
                "required" : addressObject.amount 
            }

            if (minutes > 180) 
            {
                let transactionpool     = await paymentLinkTransactionPool.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 4 } })
                let poolwallet          = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { "status": 3 } })
                response                = { amountstatus: 4,"paymentdata":paymentData,status: 200, "data": {}, message: "Your Transcation is expired." };
                var emailTemplateName = 
                { 
                    "emailTemplateName": "successtrans.ejs", 
                    "to": addressObject.clientsdetails[0].email, 
                    "subject": "LYOMERCHANT Expired Transaction", 
                    "templateData": {
                        "status": "Expired" ,
                        "paymentdata":paymentData ,
                        "transid": addressObject.id ,
                        "invoicenumber" :addressObject.invoicedetails[0].invoiceNumber,
                        "storename" :"",
                        "network" :addressObject.networkDetails[0].network ,
                        "coin" :addressObject.networkDetails[0].coin,
                        "amount" :addressObject.amount 
                }}
               
                let email_response = await emailSending.emailLogs(addressObject.id,emailTemplateName)
                console.log("email_response Success",email_response)
                return JSON.stringify(response)
            }
            amountstatus    = await amountCheck(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(BalanceOfAddress.data.format_token_balance))
            const hotWallet = await hotWallets.findOne({ "network_id": addressObject.networkDetails[0].id, "status": 1 })
           
            let GasFee = await calculateGasFee
                (
                    addressObject.networkDetails[0].nodeUrl, 
                    addressObject.networkDetails[0].libarayType,
                    addressObject.poolWallet[0].address,
                    hotWallet.address,
                    BalanceOfAddress.data.token_balance,
                    addressObject.networkDetails[0].contractAddress,
                )


                   
            if (amountstatus != 0) 
            {
                let walletbalance = BalanceOfAddress.status == 200 ? BalanceOfAddress.data.format_token_balance : 0
                
                let transactionpool = await paymentLinkTransactionPool.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": amountstatus } })
               
                let logData = { "transcationDetails": [] }
                if (amountstatus == 1 || amountstatus == 3) 
                {
                    let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, walletbalance)
                    let previouspoolwallet = await poolWallets.findOne({ id: addressObject.poolWallet[0].id })
                    if(previouspoolwallet != null)
                    {
                        let totalBalnce = parseFloat(previouspoolwallet.balance) + walletbalance
                        let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { balance: totalBalnce } })
                    }     
                  
                    if(addressObject.orderType != "fastCode")
                   {
                    let paylinkData = await payLink.findOneAndUpdate({ id: addressObject.payLinkId }, { $set: { status: amountstatus } })
                    let invoiceData = await invoice.findOneAndUpdate({ id: paylinkData.invoice_id }, { $set: { status: amountstatus } })
                    
                    if(invoiceData != null )
                    var emailTemplateName = 
                    { 
                        "emailTemplateName" : "paymentconfirmation.ejs", 
                        "to"                :  invoiceData.email, 
                        "subject"           : "LYOMERCHANT Success Transaction", 
                        "templateData"      : 
                        {
                            "status"        : "Success" ,
                            "transid"       : addressObject.id ,
                            "address"       : addressObject.poolWallet[0].address,
                            "network"       : addressObject.networkDetails[0].network ,
                            "coin"          : addressObject.networkDetails[0].coin,
                            "amount"        : addressObject.amount,
                            "orderid"       : invoiceData.invoiceNumber   
                        }}
                    let email_response = await emailSending.emailLogs(addressObject.id,emailTemplateName)
                    console.log("email_response Success",email_response)
                    }
                    let poolwallet             = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { status: 4 } })
                    let balanceTransfer        = addressObject.networkDetails[0].libarayType == "Web3" ? BalanceOfAddress.data.format_native_balance : BalanceOfAddress.data.token_balance 
                    let hot_wallet_transcation = await transfer_amount_to_hot_wallet(addressObject.poolWallet[0].id, addressObject.id, balanceTransfer, BalanceOfAddress.data.native_balance,GasFee.data.fee)
                    
                    var emailTemplateName = 
                    { 
                        "emailTemplateName": "successtrans.ejs", 
                        "to": addressObject.clientsdetails[0].email, 
                        "subject": "LYOMERCHANT Success Transaction", 
                        "templateData": {
                            "status": "Success" ,
                            "paymentdata":paymentData ,
                            "transid": addressObject.id ,
                            "invoicenumber" : addressObject.orderType =="fastCode" ?  ""  : addressObject.invoicedetails[0].invoiceNumber,
                            "storename" :"",
                            "network" :addressObject.networkDetails[0].network ,
                            "coin" :addressObject.networkDetails[0].coin,
                            "amount" :addressObject.amount 
                    }}
                    let email_response = await emailSending.emailLogs(addressObject.id,emailTemplateName)
                    console.log("email_response Success",email_response)
                    console.log("callIPN=======",addressObject.id)
                    let IPNData =  await callIPN(addressObject.id) 
                    console.log("IPNData=======",IPNData)
                    response = { amountstatus: amountstatus, "paymentdata":paymentData,status: 200, "data": logData, message: "Success" };
                    return JSON.stringify(response)
                }
                response = { amountstatus: amountstatus, "paymentdata":paymentData,status: 200, "data": logData, message: "Success" };
                return JSON.stringify(response)
            }
            else 
            {
                let trans_data = await getTranscationDataForClient(addressObject.id, "POS")
                let logData = { "transcationDetails": trans_data.length > 0 ? trans_data[0] : {} }
                response = { amountstatus: amountstatus,"paymentdata":paymentData, status: 200, "data": logData, message: "Success" };
                return JSON.stringify(response)
            }
        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            respone = { status: 400, data: {}, message: "Please Contact Admin" }
            return JSON.stringify(respone)
        }
    },
    
}
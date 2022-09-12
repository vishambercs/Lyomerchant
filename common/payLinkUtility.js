const ejs = require('ejs');
const fs = require('fs');
const Web3 = require('web3');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const transcationLog = require('../Models/transcationLog');
const network = require('../Models/network');
var qs = require('qs');
const Constant = require('./Constant');
const transferUtility = require('./transferUtility');
const Utility = require('./Utility');
const clientWallets = require('../Models/clientWallets');
const poolWallets = require('../Models/poolWallet');
const clients = require('../Models/clients');
const hotWallets = require('../Models/hotWallets');
const hot_wallet_trans_logs = require('../Models/hot_wallet_trans_logs');
require("dotenv").config()
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const TronWeb = require('tronweb')
const posTransactionPool = require('../Models/posTransactionPool');
const paymentLinkTransactionPool = require('../Models/paymentLinkTransactionPool');
const transporter = nodemailer.createTransport({ host: "srv.lyotechlabs.com", port: 465, auth: { user: "no-reply@email.lyomerchant.com", pass: "1gbA=0pVVJcS", } });
const feedWalletController = require('../controllers/Masters/feedWalletController');
const transactionPools = require('../Models/transactionPool');
const feedWallets = require('../Models/feedWallets');

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
    console.log("==============updateClientWallet============", client_api_key, networkid, merchantbalance)
    let val = await clientWallets.findOne({ api_key: client_api_key, network_id: networkid })
    if (val != null) {
        let clientWallet = await clientWallets.updateOne({ api_key: client_api_key, network_id: networkid }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * processingfee))) } })
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

async function addressFeedingFun(network_id, poolwalletAddress, amount) {
    let from_wallet = {};
    let response = {}
    let hotWallet = {};
    let created_by = 0
    try {
        from_wallet = await feedWallets.aggregate([
            { $match: { "network_id": network_id, status: 1, } },
            { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } },
        ])

        if (from_wallet != null) {
            let balance = await CheckAddress(
                from_wallet[0].networkDetails[0].nodeUrl,
                from_wallet[0].networkDetails[0].libarayType,
                from_wallet[0].address,
                from_wallet[0].networkDetails[0].contractAddress,
                from_wallet[0].privatekey)
            console.log("balance", balance)
            console.log("amount", amount)
            if (balance.status == 200 && balance.data.native_balance < amount) {
                var emailTemplateName =
                {
                    "emailTemplateName": "feedingwallet.ejs",
                    "to": process.env.FEEDING_EMAIL_REMINDER,
                    "subject": "Feed The Wallet",
                    "templateData": { "address": from_wallet[0].address, "network": from_wallet[0].networkDetails[0].network }
                }
                let email_response = await emailSending.sendEmailFunc(emailTemplateName)
                console.log("email_response", email_response)
                let datavalues = { "address": poolwalletAddress, "trans_id": "0", "transoutput": "0", "feeding_wallet_id": from_wallet[0].id }
                response = { status: 400, message: "We have informed the admin", data: datavalues }
                return response
            }
            if (from_wallet[0].networkDetails[0].libarayType == "Web3") {
                const web3 = new Web3(new Web3.providers.HttpProvider(from_wallet[0].networkDetails[0].nodeUrl))
                const pubkey = await web3.eth.accounts.privateKeyToAccount(from_wallet[0].privatekey).address;
                const balance = await web3.eth.getBalance(pubkey);
                console.log("❗ balance ", balance)
                const currentGas = await web3.eth.getGasPrice();
                console.log("❗ currentGas ", currentGas)
                console.log("❗ currentGas ", web3.utils.fromWei(currentGas, 'ether'))
                const requiredGasPrice = await web3.eth.estimateGas({ to: poolwalletAddress });
                console.log("❗ requiredGasPrice ", requiredGasPrice)
                const gas = currentGas * requiredGasPrice;
                console.log("❗ gas ", gas)
                const nonce = await web3.eth.getTransactionCount(pubkey, 'latest');
                const transaction =
                {
                    'to': poolwalletAddress,
                    'value': web3.utils.toWei(amount, 'ether'),
                    'gas': requiredGasPrice,
                    'gasPrice': currentGas,
                    'nonce': nonce
                };
                const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privatekey);
                web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                    if (!error) {
                        console.log("🎉 The hash of your transaction is: ", hash);
                        let datavalues = { "address": poolwalletAddress, "trans_id": hash, "transoutput": {}, "feeding_wallet_id": "0" }
                        response = { status: 200, message: "success", data: datavalues }
                        // res.json(response)
                        return response

                    } else {
                        console.log("❗ Something went wrong while submitting your transaction: ", error)
                        // response = { status: 200, message: "success", data: hash, "poolWalletDetails": from_wallet }
                        let datavalues = { "address": poolwalletAddress, "trans_id": "0", "transoutput": {}, "feeding_wallet_id": "0" }
                        response = 
                        {
                            status: 400,
                            message: "❗ Something went wrong while submitting your transaction: " + error,
                            data: datavalues
                         }
                        // res.json(response)
                        return response
                    }
                });


            }
            else 
            {
                const HttpProvider  = TronWeb.providers.HttpProvider;
                const fullNode      = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const solidityNode = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const eventServer = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, from_wallet[0].privatekey);
                const tradeobj = await tronWeb.transactionBuilder.sendTrx(poolwalletAddress, amount, from_wallet[0].address);
                const signedtxn = await tronWeb.trx.sign(tradeobj, from_wallet[0].privatekey);
                const receipt = await tronWeb.trx.sendRawTransaction(signedtxn).then(async (output) => {
                   let datavalues  = { "address": poolwalletAddress, "trans_id": output.txid, "transoutput": output, "feeding_wallet_id": from_wallet[0].id }
                    response        = { status: 200, message: "success", data: datavalues }
                });
                return response
            }
        }
        else {
            let datavalues = { "address": poolwalletAddress, "trans_id": "0", "transoutput": {}, "feeding_wallet_id": from_wallet[0].id }
            return { status: 400, message: "Network is not supported", data: datavalues }
        }

    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        let datavalues = { "message" : error ,"address": poolwalletAddress, "trans_id": "0", "transoutput": {}, "feeding_wallet_id": "0" }
        return { status: 400, data: datavalues, message: error.message, }
    }
}

async function transfer_amount_to_hot_wallet(poolwalletID, merchant_trans_id, account_balance, native_balance,feeLimit) {
    try {
        console.log(poolwalletID, merchant_trans_id, account_balance, native_balance,feeLimit)
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
        console.log("Hot Wallet is null ",logs) 
        return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })  
        }
        let feedinglimitPerce        = (from_wallet[0].walletNetwork[0].feedinglimitPerce == undefined || from_wallet[0].walletNetwork[0].feedinglimitPerce == "" ) ? 0.1 : from_wallet[0].walletNetwork[0].feedinglimitPerce
        let totalsend                = parseFloat(feeLimit) + ( parseFloat(account_balance) * parseFloat(feedinglimitPerce)) 
        
        if (from_wallet[0].walletNetwork[0].hotwallettranscationstatus == false) 
        {
             let message =    "Now this network is manual transfer from.." 
                var dateTime = new Date();
                let remarksData = JSON.stringify([{"message": message , "timestamp" : dateTime.toString() ,"method" : "hotwallettranscationstatus" }]) 
                const hot_wallet_trans_log = new hot_wallet_trans_logs({
                id                  : mongoose.Types.ObjectId(),
                merchant_trans_id   : merchant_trans_id,
                pool_wallet_id      : poolwalletID,
                hot_wallet_id       : hotWallet.id,
                network_id          : from_wallet[0].walletNetwork[0].id,
                trans_id            :  " ",
                feeLimit  : feeLimit,
                remarks: remarksData,
                status : 3
            });
            let logs = await hot_wallet_trans_log.save()    
            console.log("manual transfer logs=========",logs) 
            return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })  
        }
        else if (native_balance >= totalsend) {
            if (from_wallet[0].walletNetwork[0].libarayType == "Web3") {
                const pw_to_hw = await transferUtility.transfertokenWeb3(
                    from_wallet[0].walletNetwork[0].nodeUrl,
                    from_wallet[0].walletNetwork[0].contractAddress,
                    from_wallet[0].address,
                    from_wallet[0].privateKey,
                  
                    hotWallet.address,
                    account_balance
                    )
                let message =  pw_to_hw.status == 200 ?  "Web3 Transcation has created" : pw_to_hw.message
                var dateTime = new Date();
                let remarksData = JSON.stringify([{"message": message , "timestamp" : dateTime.toString() ,"method" : "transfertokenWeb3" }]) 
                const hot_wallet_trans_log = new hot_wallet_trans_logs({
                        id                  : mongoose.Types.ObjectId(),
                        merchant_trans_id   : merchant_trans_id,
                        pool_wallet_id      : poolwalletID,
                        hot_wallet_id       : hotWallet.id,
                        network_id          : from_wallet[0].walletNetwork[0].id,
                        trans_id            : pw_to_hw.status == 200 ?  pw_to_hw.data : " ",
                        feeLimit  : feeLimit,
                        remarks: remarksData,
                        status : pw_to_hw.status == 200 ? 1 : 0 
                    });
                    let logs = await hot_wallet_trans_log.save()    
                    console.log("Web3 logs=========",logs)    
            }
            else{
                const pw_to_hw = await transferUtility.transfertokenTronWeb(
                    from_wallet[0].walletNetwork[0].nodeUrl,
                    from_wallet[0].walletNetwork[0].contractAddress,
                    from_wallet[0].address,
                    from_wallet[0].privateKey,
                    hotWallet.address,
                    account_balance
                    )
                let message =  pw_to_hw.status == 200 ?  "Tron Web Transcation has created" : pw_to_hw.message
                var dateTime = new Date();
                let remarksData = JSON.stringify([{"message": message , "timestamp" : dateTime.toString() ,"method" : "transfertokenTronWeb" }]) 
                const hot_wallet_trans_log = new hot_wallet_trans_logs({
                        id                  : mongoose.Types.ObjectId(),
                        merchant_trans_id   : merchant_trans_id,
                        pool_wallet_id      : poolwalletID,
                        hot_wallet_id       : hotWallet.id,
                        network_id          : from_wallet[0].walletNetwork[0].id,
                        trans_id            : pw_to_hw.status == 200 ?  pw_to_hw.data : " ",
                        remarks: remarksData,
                        feeLimit  : feeLimit,
                        status : pw_to_hw.status == 200 ? 1 : 0 
                    });
                    let logs = await hot_wallet_trans_log.save()
                    console.log("Tron Web logs=========",logs)     
            }
            return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })
        }
        else 
        {
            let poolwallet               = await poolWallets.findOneAndUpdate({ id: poolwalletID }, { $set: { status: 4 } })
            let addressFeeding           = await addressFeedingFun(from_wallet[0].walletNetwork[0].id, from_wallet[0].address, totalsend)
            let message                  = addressFeeding.status == 200 ?  "Feeding Transcation has created" : addressFeeding.message
            var dateTime                 = new Date();
            let remarksData              = JSON.stringify([{"message": message , "timestamp" : dateTime.toString() ,"method" : "addressFeedingFun" }]) 
            const hot_wallet_trans_log   = new hot_wallet_trans_logs({
                id: mongoose.Types.ObjectId(),
                merchant_trans_id   : merchant_trans_id,
                feeding_wallet_id   : addressFeeding.data.feeding_wallet_id,
                feeding_trans_id    : addressFeeding.data.trans_id,
                pool_wallet_id      : poolwalletID,
                hot_wallet_id       : hotWallet.id,
                remarks             : remarksData,
                feeLimit            : feeLimit,
                network_id          : from_wallet[0].walletNetwork[0].id,
                status              : addressFeeding.status == 200 ? 5 : 6  
             });
            let logs = await hot_wallet_trans_log.save()
            console.log("Feeding Web logs=========",logs)   
            return JSON.stringify({ status: 200, message: "Pool Wallet", data: addressFeeding })
        }
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
        console.log("res.data.result   ", res.data.result)
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
        console.log("Type==========calculateGasFee===========", Type)
        if (Type == "Web3") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            gasPrice = await WEB3.eth.getGasPrice();
            if (ContractAddress != "") {
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
                gasAmount = await contract.methods.transfer(toAddress, WEB3.utils.toWei(`${amount}`)).estimateGas({ from: fromAddress });
                console.log("ContractAddress==========calculateGasFee===========", gasPrice, gasAmount)
                return { status: 200, data: { "fee": (gasPrice * gasAmount), "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
            }
            else {
                gasAmount = await WEB3.eth.estimateGas({ to: toAddress, from: fromAddress, value: Web3.utils.toWei(`${amount}`, 'ether'), });
                console.log("==========calculateGasFee===========", gasPrice, gasAmount)
                return { status: 200, data: { "fee": (gasPrice * gasAmount), "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
            }
        }
        else {
            console.log("else==========calculateGasFee===========", gasPrice, gasAmount)

            return { status: 200, data: { "fee": "2000000", "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
        }
    }
    catch (error) {
        console.log(error)
        return { status: 400, data: { "fee": (gasPrice * gasAmount), "gasprice": gasPrice, "gasamount": gasAmount }, message: "Error" }
    }
}
async function CheckAddress(Nodeurl, Type, Address, ContractAddress = "", privateKey = "") {
    console.log(Nodeurl, Type, Address, ContractAddress  ,privateKey )
    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {
        if (Type == "Web3") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            if (ContractAddress != "") {
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
                token_balance = await contract.methods.balanceOf(Address.toLowerCase()).call();
                let decimals = await contract.methods.decimals().call();
                format_token_balance = token_balance / (1 * 10 ** decimals)
            }
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            token_balance = native_balance
            format_token_balance = format_native_balance
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
module.exports =
{
    get_Transcation_Paylink_Data : get_Transcation_Paylink_Data,
    async getTrasnsBalance(transdata) {
        try {
            let addressObject = transdata[0]
            let response = {}
            let account_balance_in_ether = 0
            let token_balance = 0
            let native_balance = 0
            let format_token_balance = 0
            let format_native_balance = 0
            var amountstatus = 0
            let merchantbalance = 0;
            const previousdate = new Date(parseInt(addressObject.timestamps));
            const currentdate = new Date().getTime()
            var diff = currentdate - previousdate.getTime();
            var minutes = (diff / 60000)
            console.log("previousdate   ================", previousdate)
            console.log("currentdate    ================", currentdate)
            console.log("minutes        ================", minutes)
            if (minutes > 180) {
                let transactionpool     = await paymentLinkTransactionPool.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 4 } })
                let poolwallet          = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { "status": 3 } })
                response                = { amountstatus: 4, status: 200, "data": {}, message: "Your Transcation is expired." };
                return JSON.stringify(response)
            }
           
            let BalanceOfAddress = await CheckAddress(
                addressObject.networkDetails[0].nodeUrl,
                addressObject.networkDetails[0].libarayType,
                addressObject.poolWallet[0].address,
                addressObject.networkDetails[0].contractAddress,
                addressObject.poolWallet[0].privateKey
            )
            amountstatus = await amountCheck(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(BalanceOfAddress.data.format_token_balance))
            const hotWallet = await hotWallets.findOne({ "network_id": addressObject.networkDetails[0].id, "status": 1 })
           
            let GasFee = await calculateGasFee
                (
                    addressObject.networkDetails[0].nodeUrl, 
                    addressObject.networkDetails[0].libarayType,
                    addressObject.poolWallet[0].address,
                    hotWallet.address,
                    addressObject.amount,
                    addressObject.networkDetails[0].contractAddress)
           
                   
            if (amountstatus != 0) 
            {
                let walletbalance = BalanceOfAddress.status == 200 ? BalanceOfAddress.data.format_token_balance : 0
               
                let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, walletbalance)
               
                let transactionpool = await paymentLinkTransactionPool.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": amountstatus } })
               
                let previouspoolwallet = await poolWallets.findOne({ id: addressObject.poolWallet[0].id })
                
                if(previouspoolwallet != null)
                {
                    let totalBalnce = parseFloat(previouspoolwallet.balance) + walletbalance
                    let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { balance: totalBalnce } })
                  
                }     
                // let get_transcation_response    = await getTranscationList(addressObject.poolWallet[0].address, addressObject.id, addressObject.networkDetails[0].id)
                // let trans_data                  = await getTranscationDataForClient(addressObject.id)
                let logData = { "transcationDetails": [] }
             
                if (amountstatus == 1 || amountstatus == 3) 
                {
                    let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { status: 4 } })
                  
                    
                    let hot_wallet_transcation = await transfer_amount_to_hot_wallet(addressObject.poolWallet[0].id, addressObject.id, BalanceOfAddress.data.token_balance, BalanceOfAddress.data.native_balance,GasFee.data.fee)
                    console.log("hot_wallet_transcation",hot_wallet_transcation)
                }
                response = { amountstatus: amountstatus, status: 200, "data": logData, message: "Success" };
                return JSON.stringify(response)
            }
            else 
            {
                let trans_data = await getTranscationDataForClient(addressObject.id, "POS")
                let logData = { "transcationDetails": trans_data.length > 0 ? trans_data[0] : {} }
                response = { amountstatus: amountstatus, status: 200, "data": logData, message: "Success" };
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
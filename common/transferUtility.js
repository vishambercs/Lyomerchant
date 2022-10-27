const ejs = require('ejs');
const fs = require('fs');
const Web3 = require('web3');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const transcationLog = require('../Models/transcationLog');
const feedWallets = require('../Models/feedWallets');
const network = require('../Models/network');
var qs = require('qs');
const Constant = require('./Constant');
const transferUtility = require('./transferUtility');
const Utility = require('./Utility');
const clientWallets = require('../Models/clientWallets');
const poolWallets = require('../Models/poolWallet');
const emailSending = require('./emailSending');
const clients = require('../Models/clients');
const hotWallets = require('../Models/hotWallets');
const hot_wallet_trans_logs = require('../Models/hot_wallet_trans_logs');
require("dotenv").config()
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const TronWeb = require('tronweb')
const posTransactionPool = require('../Models/posTransactionPool');
const transporter = nodemailer.createTransport({ host: "srv.lyotechlabs.com", port: 465, auth: { user: "no-reply@email.lyomerchant.com", pass: "1gbA=0pVVJcS", } });
const feedWalletController = require('../controllers/Masters/feedWalletController');
const transactionPools = require('../Models/transactionPool');

async function transfertokenWeb3(nodeUrl, contractAddress, fromaddress, privateKey, toaddress, balance, gas = 100000) {
    try {
        console.log("transfertokenWeb3", balance,gas)
        var web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
        const contract = new web3.eth.Contract(Constant.USDT_ABI, contractAddress, { from: fromaddress })
        let decimals = await contract.methods.decimals().call();
        let amount = web3.utils.numberToHex(balance);
        const accounttransfer = contract.methods.transfer(toaddress, amount).encodeABI();
        const nonce = await web3.eth.getTransactionCount(fromaddress, 'latest');
        const transaction = { gas: gas, "to": contractAddress, "value": web3.utils.toWei("0", 'ether'), "data": accounttransfer, "from": fromaddress }
        const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
        let responsedata = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, async function (error, hash) {
            if (!error) {
                return { status: 200, message: "Done Successfully", data: hash }
            } else {
                console.log("❗Something went wrong while submitting your transaction:", error)
                return { status: 400, message: error, data: "" }
            }
        })
        return { status: 200, message: "Done", data: responsedata.transactionHash , output: responsedata }
    }
    catch (error) {
        console.log("transfertokenWeb3", error)
        return { status: 401, data: "", output: "",message: error.message }
    }
}

async function transfertokenTronWeb(nodeUrl, contractAddress, fromaddress, privateKey, toaddress, balance, gas = 10000000000) {
    try {

        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider(nodeUrl);
        const solidityNode = new HttpProvider(nodeUrl);
        const eventServer = new HttpProvider(nodeUrl);
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
        let contract = await tronWeb.contract().at(contractAddress);
        let hash = await contract.transfer(toaddress, balance).send({ feeLimit: gas })
        return { status: 200, message: "Pool Wallet", data: hash , output: hash }
    }
    catch (error) {
        console.log("transfertokenTronWeb", error)
        return { status: 401, data: "", message: error.message }
    }
}

async function check_Status_Feeding_Transcation(nodeUrl, libarayType, privateKey, tranxid) {
    try {
        if (libarayType == "Tronweb") {
            const HttpProvider = TronWeb.providers.HttpProvider;
            const fullNode = new HttpProvider(nodeUrl);
            const solidityNode = new HttpProvider(nodeUrl);
            const eventServer = new HttpProvider(nodeUrl);
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            // let getConfirmedTransc = await tronWeb.trx.getConfirmedTransaction(tranxid);
            // let UnconfirmedTransactionInfo = await tronWeb.trx.getUnconfirmedTransactionInfo(tranxid)
            // let transinfo = await tronWeb.trx.getTransactionInfo(tranxid);
            // let failedtransinfo = await tronWeb.trx.getTransactionInfo("1d806b6e2e878886fd0f189755f7de22b95efdaf3e4ad0155a6eee204997c0ba");
            // let notgetConfirmedTransc = await tronWeb.trx.getConfirmedTransaction("1d806b6e2e878886fd0f189755f7de22b95efdaf3e4ad0155a6eee204997c0ba");
            let getConfirmedTransc = await tronWeb.trx.getConfirmedTransaction(tranxid);
            let datavalues = { "transinfo":getConfirmedTransc.ret[0].contractRet }
            return { status: 200, message: "Get Feeding Wallet Transcation Status", data: getConfirmedTransc.ret[0].contractRet }
        }
        else {
            let datavalues = { "confirm": {}, "Unconfirm": {} }
            const WEB3          = new Web3(new Web3.providers.HttpProvider(nodeUrl))
            let hashtrans       = await WEB3.eth.getTransactionReceipt(tranxid)
            console.log(hashtrans)
            let status          =  hashtrans.status == true ? "SUCCESS" : ""
            return { status: 200, message: "Get Feeding Wallet Transcation Status", data: status }
        }
    }
    catch (error) {
        console.log("check_Status_Feeding_Transcation", error)
        return { status: 400, data: {}, message: "Error" }
    }
}
async function Check_BTC_Balance(address) {
    try {
        let COINGECKO_URL = "http://blockchain.info/q/addressbalance/" + address
        response = {}
        await axios.get(COINGECKO_URL, { params: {}, headers: {} }).then(res => {
            var stringify_response = stringify(res)
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        }).catch(error => {
            console.error("Error", error)
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
        var stringify_response = JSON.parse(response.data)
        let balance_format = parseFloat(stringify_response.data) / 100000000
        // return { "status": 200, "balance": stringify_response.data, "format_balance": balance_format }
        let balanceData = { "token_balance":  stringify_response.data, "format_token_balance": balance_format, "native_balance": stringify_response.data, "format_native_balance": balance_format }
        return { status: 200, data: balanceData, message: "sucess" }
    }
    catch (error) {
        console.log("error", error)
        let balanceData = 
    { 
        "token_balance"         :  0, 
        "format_token_balance"  :  0, 
        "native_balance"        :  0, 
        "format_native_balance" :  0 
    }
        return { status: 400, data: balanceData, message: "Error" }
    }
}
async function CheckAddress(Nodeurl, Type, Address, ContractAddress = "", privateKey = "") {
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
            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if(Type == "Tronweb") {
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
        else
        {
            let response =   await Check_BTC_Balance(Address.toLowerCase())
            return response
        }
      
    }
    catch (error) {
        console.log(error)
        let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
        return { status: 400, data: balanceData, message: "Error" }
    }
}

async function push_The_Remarks(remarks, message, method) {
    try {
        let remarksarray = JSON.parse(remarks);
        var dateTime = new Date();
        remarksarray.push(
            {
                "message": message,
                "timestamp": dateTime.toString(),
                "method": method
            })
        return { status: 200, data: JSON.stringify(remarksarray), "message": "Success" }
    }

    catch (error) {
        console.log("error", error)
        return { status: 400, data: JSON.stringify(remarks), "message": "Error" }
    }
}

async function transferNativeTronWeb(nodeUrl, fromaddress, privateKey, toaddress, balance, gas = 10000000000) {
    try {
        console.log(balance)
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider(nodeUrl);
        const solidityNode = new HttpProvider(nodeUrl);
        const eventServer = new HttpProvider(nodeUrl);
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
        const tradeobj = await tronWeb.transactionBuilder.sendTrx(toaddress, balance, fromaddress);
        const signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
        const receipt = await tronWeb.trx.sendRawTransaction(signedtxn)
        return { status: 200, message: "Pool Wallet", data: receipt.txid }

    }
    catch (error) {
        console.log("transfertokenWeb3", error)
        return { status: 400, data: "", message: error }
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
async function transfer_amount_to_hot_wallet(poolwalletID, merchant_trans_id, account_balance, native_balance, feeLimit) {
    try {
        const from_wallet = await poolWallets.aggregate([
            { $match: { "id": poolwalletID } },
            { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "walletNetwork" } },
        ])
        const hotWallet = await hotWallets.findOne({ "network_id": from_wallet[0].network_id, "status": 1 })

        if (hotWallet == null) {
          let message     = "Please Add hot wallets"
          var dateTime    = new Date();
          let remarksData = JSON.stringify([{ "message": message, "timestamp": dateTime.toString(), "method": "hotWallet Wallet Null" }])
          let logs        = await Save_Trans_logs(merchant_trans_id, poolwalletID, from_wallet[0].walletNetwork[0].id, "", "", feeLimit, remarksData, 4)
          return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })
        }
          let poolwallet        = await poolWallets.findOneAndUpdate({ id: poolwalletID }, { $set: { status: 4 } })
          var dateTime          = new Date();
          let remarksData       = JSON.stringify([{ "message": "We are sending", "timestamp": dateTime.toString(), "method": "transfer_amount_to_hot_wallet" }])
          let feedinglimitPerce = (from_wallet[0].walletNetwork[0].feedinglimitPerce == undefined || from_wallet[0].walletNetwork[0].feedinglimitPerce == "") ? 0.1 : from_wallet[0].walletNetwork[0].feedinglimitPerce
          let totalsend         = parseFloat(feeLimit) + (parseFloat(account_balance) * parseFloat(feedinglimitPerce))
          let logs              = await Save_Trans_logs("", "",merchant_trans_id, poolwalletID, from_wallet[0].walletNetwork[0].id, hotWallet.id, "", feeLimit, remarksData, 5)
          return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })
        }
    catch (error) {
        console.log("Message %s sent: %s", error);
        respone = { status: 400, data: {}, message: error.message }
        return JSON.stringify(respone)
    }
}
async function calculateGasFee(Nodeurl, Type, fromAddress, toAddress, amount, ContractAddress = "") {
    let gasAmount = 0
    let gasPrice = 0
    try {
       
        if (Type == "Web3") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            gasPrice = await WEB3.eth.getGasPrice();
            if (ContractAddress != "") 
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
                const currentGas = await web3.eth.getGasPrice();
                const requiredGasPrice = await web3.eth.estimateGas({ to: poolwalletAddress });
                const gas = currentGas * requiredGasPrice;
                const nonce = await web3.eth.getTransactionCount(pubkey, 'latest');
                const transaction =
                {
                    'to': poolwalletAddress,
                    'value': web3.utils.toWei(amount.toString(), 'ether'),
                    'gas': requiredGasPrice,
                    'gasPrice': currentGas,
                    'nonce': nonce
                };
                const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privatekey);
                 let transresponse = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                    if (!error) {
                        console.log("🎉 The hash of your transaction is: ", hash);
                        let datavalues = { "address": poolwalletAddress, "trans_id": hash, "transoutput": {}, "feeding_wallet_id": from_wallet[0].id  }
                        return { status: 200, message: "success", data: datavalues }
                    } else {
                        console.log("Something went wrong while submitting your transaction: ", error)
                        let datavalues = { "address": poolwalletAddress, "trans_id": "0", "transoutput": {}, "feeding_wallet_id": from_wallet[0].id  }
                        return  {
                            status: 400,
                            message: "Something went wrong while submitting your transaction: " + error,
                            data: datavalues
                         }
                        
                    }
                });
                let datavalues = { "address": poolwalletAddress, "trans_id": transresponse.transactionHash, "transoutput": transresponse, "feeding_wallet_id": from_wallet[0].id  }
                
                return { status: 200, message: "success", data: datavalues }
                

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
        console.log("addressFeedingFun", error);
        let datavalues = { "message" : error ,"address": poolwalletAddress, "trans_id": "0", "transoutput": {}, "feeding_wallet_id": "0" }
        return { status: 400, data: datavalues, message: error.message, }
    }
}

async function updateClientWallet(client_api_key, networkid, merchantbalance, processingfee = 0.01) 
{
    let val = await clientWallets.findOne({ client_api_key: client_api_key, network_id: networkid })
    if (val != null) 
    {
        let clientWallet = await clientWallets.updateOne({ client_api_key: client_api_key, network_id: networkid }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * processingfee))) } })
        return clientWallet
    }
    else 
    {
        const clientWallet = new clientWallets
        ({
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

module.exports =
{
    calculateGasFee:calculateGasFee,
    updateClientWallet:updateClientWallet,
    transfertokenWeb3: transfertokenWeb3,
    transfertokenTronWeb: transfertokenTronWeb,
    check_Status_Feeding_Transcation: check_Status_Feeding_Transcation,
    CheckBalanceOfAddress: CheckAddress,
    push_The_Remarks: push_The_Remarks,
    transferNativeTronWeb: transferNativeTronWeb,
    transfer_amount_to_hot_wallet: transfer_amount_to_hot_wallet,
}
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
const transporter = nodemailer.createTransport({ host: "srv.lyotechlabs.com", port: 465, auth: { user: "no-reply@email.lyomerchant.com", pass: "1gbA=0pVVJcS", } });
const feedWalletController = require('../controllers/Masters/feedWalletController');
const transactionPools = require('../Models/transactionPool');

async function transfertokenWeb3(nodeUrl, contractAddress, fromaddress, privateKey, toaddress, balance, gas = 100000) {
    try {
        var web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
        const contract = new web3.eth.Contract(Constant.USDT_ABI, contractAddress, { from: fromaddress })
        let decimals = await contract.methods.decimals().call();
        let amount = web3.utils.numberToHex(balance);
        const accounttransfer = contract.methods.transfer(toaddress, amount).encodeABI();
        const nonce = await web3.eth.getTransactionCount(fromaddress, 'latest');
        const transaction = { gas: gas, "to": contractAddress, "value": "0x00", "data": accounttransfer, "from": fromaddress }
        const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction, async function (error, hash) {
            if (!error) {
                return { status: 200, message: "Done Successfully", data: hash }
            } else {
                console.log("❗Something went wrong while submitting your transaction:", error)
                return { status: 400, message: error, data: "" }
            }
        })
    }
    catch (error) {
        console.log("transfertokenWeb3", error)
        return { status: 400, data: "", message: "Error" }
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
        return { status: 200, message: "Pool Wallet", data: hash }
    }
    catch (error) {
        console.log("transfertokenWeb3", error)
        return { status: 400, data: "", message: error }
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
            let getConfirmedTransc = await tronWeb.trx.getConfirmedTransaction(tranxid);
            let UnconfirmedTransactionInfo = tronWeb.trx.getUnconfirmedTransactionInfo(tranxid)
            let datavalues = { "confirm": getConfirmedTransc, "Unconfirm": UnconfirmedTransactionInfo, }
            return { status: 200, message: "Get Feeding Wallet Transcation Status", data: datavalues }
        }
        else {
            let datavalues = { "confirm": {}, "Unconfirm": {} }
            return { status: 200, message: "Get Feeding Wallet Transcation Status", data: datavalues }
        }
    }
    catch (error) {
        console.log("check_Status_Feeding_Transcation", error)
        return { status: 400, data: {}, message: "Error" }
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

    // let message = "Please Add hot wallets"
    // var dateTime = new Date();
    // let remarksData = JSON.stringify([{ "message": message, "timestamp": dateTime.toString(), "method": "hotWallet Wallet Null" }])
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
            let message = "Please Add hot wallets"
            var dateTime = new Date();
            let remarksData = JSON.stringify([{ "message": message, "timestamp": dateTime.toString(), "method": "hotWallet Wallet Null" }])
            //     const hot_wallet_trans_log = new hot_wallet_trans_logs({
            //     id                  : mongoose.Types.ObjectId(),
            //     merchant_trans_id   : merchant_trans_id,
            //     pool_wallet_id      : poolwalletID,
            //     network_id          : from_wallet[0].walletNetwork[0].id,   
            //     hot_wallet_id       : " ",
            //     trans_id            :  " ",
            //     feeLimit  : feeLimit,
            //     remarks: remarksData,
            //     status : 4
            // });
            let logs = await Save_Trans_logs(merchant_trans_id, poolwalletID, from_wallet[0].walletNetwork[0].id, "", "", feeLimit, remarksData, 4)
            console.log("Hot Wallet is null ", logs)
            return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })
        }
        let feedinglimitPerce = (from_wallet[0].walletNetwork[0].feedinglimitPerce == undefined || from_wallet[0].walletNetwork[0].feedinglimitPerce == "") ? 0.1 : from_wallet[0].walletNetwork[0].feedinglimitPerce
        let totalsend = parseFloat(feeLimit) + (parseFloat(account_balance) * parseFloat(feedinglimitPerce))

        if (from_wallet[0].walletNetwork[0].hotwallettranscationstatus == false) {
            let message = "Now this network is manual transfer from.."
            var dateTime = new Date();
            let remarksData = JSON.stringify([{ "message": message, "timestamp": dateTime.toString(), "method": "hotwallettranscationstatus" }])
            //     const hot_wallet_trans_log = new hot_wallet_trans_logs({
            //     id                  : mongoose.Types.ObjectId(),
            //     merchant_trans_id   : merchant_trans_id,
            //     pool_wallet_id      : poolwalletID,
            //     hot_wallet_id       : hotWallet.id,
            //     network_id          : from_wallet[0].walletNetwork[0].id,
            //     trans_id            :  " ",
            //     feeLimit  : feeLimit,
            //     remarks: remarksData,
            //     status : 3
            // });
            // let logs = await hot_wallet_trans_log.save()   
            let logs = await Save_Trans_logs(merchant_trans_id, poolwalletID, from_wallet[0].walletNetwork[0].id, hotWallet.id, "", feeLimit, remarksData, 3)
            console.log("manual transfer logs=========", logs)
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
                let message = pw_to_hw.status == 200 ? "Web3 Transcation has created" : pw_to_hw.message
                var dateTime = new Date();
                let remarksData = JSON.stringify([{ "message": message, "timestamp": dateTime.toString(), "method": "transfertokenWeb3" }])
                // const hot_wallet_trans_log = new hot_wallet_trans_logs({
                //         id                  : mongoose.Types.ObjectId(),
                //         merchant_trans_id   : merchant_trans_id,
                //         pool_wallet_id      : poolwalletID,
                //         hot_wallet_id       : hotWallet.id,
                //         network_id          : from_wallet[0].walletNetwork[0].id,
                //         trans_id            : pw_to_hw.status == 200 ?  pw_to_hw.data : " ",
                //         feeLimit  : feeLimit,
                //         remarks: remarksData,
                //         status : pw_to_hw.status == 200 ? 1 : 0 
                //     });
                let trans_id = pw_to_hw.status == 200 ? pw_to_hw.data : " ";
                let statusdata = pw_to_hw.status == 200 ? 1 : 0;
                let logs = await Save_Trans_logs(merchant_trans_id, poolwalletID, from_wallet[0].walletNetwork[0].id, hotWallet.id, trans_id, feeLimit, remarksData, statusdata)
                console.log("Web3 logs=========", logs)
            }
            else {
                const pw_to_hw = await transferUtility.transfertokenTronWeb(
                    from_wallet[0].walletNetwork[0].nodeUrl,
                    from_wallet[0].walletNetwork[0].contractAddress,
                    from_wallet[0].address,
                    from_wallet[0].privateKey,
                    hotWallet.address,
                    account_balance
                )
                let message = pw_to_hw.status == 200 ? "Tron Web Transcation has created" : pw_to_hw.message
                var dateTime = new Date();
                let remarksData = JSON.stringify([{ "message": message, "timestamp": dateTime.toString(), "method": "transfertokenTronWeb" }])
                // const hot_wallet_trans_log = new hot_wallet_trans_logs({
                //         id                  : mongoose.Types.ObjectId(),
                //         merchant_trans_id   : merchant_trans_id,
                //         pool_wallet_id      : poolwalletID,
                //         hot_wallet_id       : hotWallet.id,
                //         network_id          : from_wallet[0].walletNetwork[0].id,
                //         trans_id            : pw_to_hw.status == 200 ?  pw_to_hw.data : " ",
                //         remarks: remarksData,
                //         feeLimit  : feeLimit,
                //         status : pw_to_hw.status == 200 ? 1 : 0 
                //     });
                //     let logs = await hot_wallet_trans_log.save()
                let trans_id = pw_to_hw.status == 200 ? pw_to_hw.data : " ";
                let statusdata = pw_to_hw.status == 200 ? 1 : 0;
                let logs = await Save_Trans_logs(merchant_trans_id, poolwalletID, from_wallet[0].walletNetwork[0].id, hotWallet.id, trans_id, feeLimit, remarksData, statusdata)
                console.log("Tron Web logs=========", logs)
            }
            return JSON.stringify({ status: 200, message: "Pool Wallet", data: {} })
        }
        else {
            let poolwallet = await poolWallets.findOneAndUpdate({ id: poolwalletID }, { $set: { status: 4 } })
            let addressFeeding = await feedWalletController.addressFeedingFun(from_wallet[0].walletNetwork[0].id, from_wallet[0].address, totalsend)
            let message = addressFeeding.status == 200 ? "Feeding Transcation has created" : addressFeeding.message
            var dateTime = new Date();
            let remarksData = JSON.stringify([{ "message": message, "timestamp": dateTime.toString(), "method": "addressFeedingFun" }])
            // const hot_wallet_trans_log   = new hot_wallet_trans_logs({
            //     id: mongoose.Types.ObjectId(),
            //     merchant_trans_id   : merchant_trans_id,
            //     feeding_wallet_id   : addressFeeding.data.feeding_wallet_id,
            //     feeding_trans_id    : addressFeeding.data.trans_id,
            //     pool_wallet_id      : poolwalletID,
            //     hot_wallet_id       : hotWallet.id,
            //     remarks             : remarksData,
            //     feeLimit            : feeLimit,
            //     network_id          : from_wallet[0].walletNetwork[0].id,
            //     status              : addressFeeding.status == 200 ? 5 : 6  
            //  });
            // let logs = await hot_wallet_trans_log.save()
            let feeding_wallet_id = addressFeeding.data.feeding_wallet_id;
            let feeding_trans_id = addressFeeding.data.trans_id;
            let statusdata = addressFeeding.status == 200 ? 5 : 6;
            let logs = await Save_Trans_logs(feeding_wallet_id, feeding_trans_id, merchant_trans_id, poolwalletID, from_wallet[0].walletNetwork[0].id, hotWallet.id, "", feeLimit, remarksData, statusdata)
            console.log("Feeding Web logs=========", logs)
            return JSON.stringify({ status: 200, message: "Pool Wallet", data: addressFeeding })
        }
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
module.exports =
{
    transfertokenWeb3: transfertokenWeb3,
    transfertokenTronWeb: transfertokenTronWeb,
    check_Status_Feeding_Transcation: check_Status_Feeding_Transcation,
    CheckBalanceOfAddress: CheckAddress,
    push_The_Remarks: push_The_Remarks,
    transferNativeTronWeb: transferNativeTronWeb,
    transfer_amount_to_hot_wallet: transfer_amount_to_hot_wallet,
}
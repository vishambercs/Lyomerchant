const ejs = require('ejs');
const fs = require('fs');
const Web3 = require('web3');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const transcationLog = require('../Models/transcationLog');
const network = require('../Models/network');
var qs = require('qs');
const Constant = require('./Constant');
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
        pooldata = await posTransactionPool.aggregate(
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

async function savelogs(merchant_trans_id, hot_wallet_id, trans_id, network_id, status, remarks) {
    const hot_wallet_trans_log = new hot_wallet_trans_logs({
        id: mongoose.Types.ObjectId(),
        merchant_trans_id: merchant_trans_id,
        hot_wallet_id: hot_wallet_id,
        trans_id: trans_id,
        network_id: network_id,
        status: status,
        remarks: remarks,
    });
    let logs = await hot_wallet_trans_log.save().then(async (val) => {
        return JSON.stringify({ status: 200, message: "Client Added Successfully", data: val })
    }).catch(error => {
        console.log(error)
        return JSON.stringify({ status: 400, data: {}, message: error })
    })
    return logs;
}

async function transfer_amount_to_hot_wallet(poolwalletID, merchant_trans_id, account_balance) {
    try {
        const from_wallet = await poolWallets.aggregate([
            { $match: { "id": poolwalletID } },
            { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "walletNetwork" } },
        ])
        const hotWallet = await hotWallets.findOne({ "network_id": from_wallet[0].network_id, "status": 1 })
        if (from_wallet[0].walletNetwork[0].hotwallettranscationstatus == false) {
            savelogs(merchant_trans_id, hotWallet.id, " ", from_wallet[0].network_id, 1, "Now this network is manual transfer from..")
        }
        else if (hotWallet != null) {

            let feedWallets = await feedWalletController.CheckBalanceOfAddress(
                from_wallet[0].walletNetwork[0].nodeUrl,
                from_wallet[0].networkDetails[0].libarayType,
                from_wallet[0].address,
                from_wallet[0].networkDetails[0].contractAddress,
                from_wallet[0].privatekey
            )
            console.log("feedWallets", feedWallets)


            if (from_wallet[0].walletNetwork[0].libarayType == "Web3") {

                var web3 = new Web3(new Web3.providers.HttpProvider(from_wallet[0].walletNetwork[0].nodeUrl));
                const contract = new web3.eth.Contract(Constant.USDT_ABI, from_wallet[0].walletNetwork[0].contractAddress, { from: from_wallet[0].address })
                let decimals = await contract.methods.decimals().call();
                let amount = account_balance;
                amount = web3.utils.numberToHex(amount);
                const accounttransfer = contract.methods.transfer(hotWallet.address, amount).encodeABI();
                const nonce = await web3.eth.getTransactionCount(from_wallet[0].address, 'latest');
                const transaction = { gas: web3.utils.toHex(100000), "to": from_wallet[0].walletNetwork[0].contractAddress, "value": "0x00", "data": accounttransfer, "from": from_wallet[0].address }
                const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privateKey);
                web3.eth.sendSignedTransaction(signedTx.rawTransaction, async function (error, hash) {
                    if (!error) {
                        savelogs(merchant_trans_id, hotWallet.id, hash, from_wallet[0].network_id, 1, "Done")
                        console.log("your transaction:", hash)
                        const poolWallet = await poolWallets.updateOne({ id: from_wallet[0].id }, { $set: { balance: 0, status: 0 } })
                        console.log("your transaction:", poolWallet)
                        return JSON.stringify({ status: 200, message: "Pool Wallet", data: hash })
                    } else {
                        console.log("❗Something went wrong while submitting your transaction:", error)
                        savelogs(merchant_trans_id, hotWallet.id, " ", from_wallet[0].network_id, 2, error)
                        return JSON.stringify({ status: 200, message: "Pool Wallet", data: error })
                    }
                })
            }
            else {
                const HttpProvider = TronWeb.providers.HttpProvider;
                const fullNode = new HttpProvider(from_wallet[0].walletNetwork[0].nodeUrl);
                const solidityNode = new HttpProvider(from_wallet[0].walletNetwork[0].nodeUrl);
                const eventServer = new HttpProvider(from_wallet[0].walletNetwork[0].nodeUrl);
                const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, from_wallet[0].privateKey);
                let contract = await tronWeb.contract().at(from_wallet[0].walletNetwork[0].contractAddress);
                let result345 = await contract.transfer(hotWallet.address, account_balance).send({ feeLimit: 10000000000 })
                const poolWallet = await poolWallets.updateOne({ id: from_wallet[0].id }, { $set: { balance: 0, status: 0 } })
                savelogs(merchant_trans_id, hotWallet.id, result345, from_wallet[0].network_id, 1, "Done")
                return JSON.stringify({ status: 200, message: "Pool Wallet", data: result345 })
            }
        }


        else {
            savelogs(merchant_trans_id, " ", " ", from_wallet[0].network_id, 2, "Network is not supported")
            return JSON.stringify({ status: 400, message: "Network is not supported", data: null })
        }

    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        savelogs(merchant_trans_id, " ", " ", "aksdbaksbd", 2, error)
        respone = { status: 400, data: {}, message: error.message }
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
module.exports =
{
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
            if (minutes > 1) {
                let transactionpool = await posTransactionPool.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 4 } })
                let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { "status": 3 } })
                response = { amountstatus: 1, status: 200, "data": {}, message: "Your Transcation is expired." };
                return JSON.stringify(response)
            }
            let BalanceOfAddress = await feedWalletController.CheckBalanceOfAddress(
                addressObject.networkDetails[0].nodeUrl,
                addressObject.networkDetails[0].libarayType,
                addressObject.poolWallet[0].address,
                addressObject.networkDetails[0].contractAddress,
                addressObject.poolWallet[0].privateKey
            )
            amountstatus = await amountCheck(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(BalanceOfAddress.data.format_token_balance))
            console.log("feedWallets", BalanceOfAddress)
            console.log("amountstatus", amountstatus)
            console.log("amountstatus", BalanceOfAddress.data.format_token_balance)
            const hotWallet = await hotWallets.findOne({ "network_id": addressObject.networkDetails[0].id, "status": 1 })
            let GasFee = await feedWalletController.calculateGasFee
                (
                    addressObject.networkDetails[0].nodeUrl, addressObject.networkDetails[0].libarayType,
                    addressObject.poolWallet[0].address,
                    hotWallet.address,
                    addressObject.amount,
                    addressObject.networkDetails[0].contractAddress)

            if (amountstatus != 0) {
                // let val                      = await clientWallets.findOne({ api_key: addressObject.api_key, network_id: addressObject.networkDetails[0].id })
                // let clientWallet             = await clientWallets.updateOne({ api_key: addressObject.api_key, network_id: addressObject.networkDetails[0].id }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * 0.01))) } })
                let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, merchantbalance)
                let transactionpool = await posTransactionPool.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": amountstatus } })
                // let get_transcation_response    = await getTranscationList(addressObject.poolWallet[0].address, addressObject.id, addressObject.networkDetails[0].id)
                // let trans_data                  = await getTranscationDataForClient(addressObject.id)
                let logData = { "transcationDetails": [] }
                if (amountstatus == 1 || amountstatus == 3) {
                    console.log("amountstatus", BalanceOfAddress.data.format_token_balance)
                    if (BalanceOfAddress.data.format_native_balance > 0) 
                    {
                        console.log("===========if addressFeeding======", BalanceOfAddress)
                        let hot_wallet_transcation = await transfer_amount_to_hot_wallet(addressObject.poolWallet[0].id, addressObject.id, token_balance)
                    }
                    else {
                        let addressFeedingamount = addressObject.networkDetails[0].libarayType == "Tronweb" ? 2 : GasFee.feeLimit
                        console.log("===========addressFeedingamount======", addressFeedingamount)
                        let addressFeeding = await feedWalletController.addressFeedingFun(addressObject.networkDetails[0].id, addressObject.poolWallet[0].address, addressFeedingamount)
                        console.log("===========else addressFeeding======", addressFeeding)
                        if (addressFeeding.status == 400) {
                            let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { status: 4 } })
                        }
                        let get_addressObject = await postRequest(addressObject.callbackURL, logData, {})
                    }
                }
                response = { amountstatus: amountstatus, status: 200, "data": logData, message: "Success" };
                return JSON.stringify(response)
            }
            else {
                let trans_data = await getTranscationDataForClient(addressObject.id, "POS")
                let logData = { "transcationDetails": trans_data.length > 0 ? trans_data[0] : {} }
                response = { amountstatus: amountstatus, status: 200, "data": { "logData": logData, "token_balance": token_balance, "format_native_balance": format_native_balance, "format_token_balance": format_token_balance, "native_balance": native_balance }, message: "Success" };
                return JSON.stringify(response)
            }
        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            respone = { status: 400, data: {}, message: "Please Contact Admin" }
            return JSON.stringify(respone)
        }
    },
    async getPosTranscationData(transkey) {

        let pooldata = await posTransactionPool.aggregate(
            [
                { $match: { id: transkey } },
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
}
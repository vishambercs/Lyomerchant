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
const btchotwallet = require('../Models/btchotwallet');
const IPNS = require('../Models/IPN');
const topup = require('../Models/topup');
const emailSending = require('./emailSending'); 
const transUtility = require('./transUtilityFunction');

async function get_Transcation_topup(transkey) {

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
async function pricecalculation(coinid, balance) {
    try {
        let networks = await network.findOne({ 'id': coinid })
        let networktitle = networks.currencyid.toLowerCase()
        let parameters = `ids=${networks.currencyid}&vs_currencies=usd`
        let COINGECKO_URL = process.env.COINGECKO + parameters
        response = {}
        await axios.get(COINGECKO_URL, {
            params: {},
            headers: {}
        }).then(res => {
            var stringify_response = stringify(res)
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        })
            .catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
            })

        var stringify_response = JSON.parse(response.data)
        let pricedata = stringify_response.data
        let pricedatacurrency = pricedata[networktitle]
        let price = parseFloat(pricedatacurrency["usd"]) * parseFloat(balance)
        return price;
    }
    catch (error) {
        console.log("pricecalculation", error)
        return 0;

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
        else if (Type == "btcnetwork") {
            let COINGECKO_URL = "http://blockchain.info/q/addressbalance/" + Address
            response = {}
            await axios.get(COINGECKO_URL, {
                params: {},
                headers: {}
            }).then(res => {
                var stringify_response = stringify(res)
                console.log(stringify_response)
                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }

            }).catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
                console.log(stringify_response)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };

            })
            var stringify_response = JSON.parse(response.data)
            console.log("data", stringify_response.data)
            let balance_format = parseFloat(stringify_response.data) / 100000000
            console.log("balance_format", balance_format)
            let balanceData =
            {
                "token_balance": stringify_response.data,
                "format_token_balance": balance_format,
                "native_balance": stringify_response.data,
                "format_native_balance": balance_format
            }
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

    }
    catch (error) {
        console.log(error)
        let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
        return { status: 400, data: balanceData, message: "Error" }
    }
}
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
            status: 1,
            network_id: networkid,
            balance: (merchantbalance - (merchantbalance * processingfee)),
            remarks: "Please Generate The Wallet Address Of this type"
        });
        let client_Wallet = await clientWallet.save()
        return client_Wallet
    }
}
async function getTranscationDataForClient(transkey) {

    let pooldata = await topup.aggregate(
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
async function postRequest(URL, parameters, headers) {
    let response = {}
    await axios.post(URL,
        qs.stringify(parameters),
        { headers: headers })
        .then(res => {
            var stringify_response = stringify(res)
            console.log("==========postRequest=========", res)
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        })
        .catch(error => {
            var stringify_response = stringify(error)
            // console.log("==========post-request-error=========", error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
    return response;
}

async function getTrasnsBalance(transdata) {
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

        if (addressObject.timestamps == null || addressObject.timestamps == undefined) {
            response = { amountstatus: 0, "paymentdata": {}, status: 200, "data": {}, message: "Success" };
            return JSON.stringify(response)
        }
        const previousdate = new Date(parseInt(addressObject.timestamps));
        const currentdate = new Date().getTime()
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
        let remain = parseFloat(addressObject.amount) - parseFloat(BalanceOfAddress.data.format_token_balance)
        let paymentData = { "remain": remain, "paid": BalanceOfAddress.data.format_token_balance, "required": addressObject.amount }

        if (minutes > 180) {
            let transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 4 } })
            let walletbalance = BalanceOfAddress.status == 200 ? BalanceOfAddress.data.format_token_balance : 0
            let previouspoolwallet = await poolWallets.findOne({ id: addressObject.poolWallet[0].id })
            let totalBalnce = parseFloat(previouspoolwallet.balance) + walletbalance
            let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { "status": 3, "balance": totalBalnce } })
            response = { amountstatus: 4, "paymentdata": paymentData, status: 200, "data": {}, message: "Your Transcation is expired." };
            var emailTemplateName =
            {
                "emailTemplateName": "successtrans.ejs",
                "to": addressObject.clientdetails[0].email,
                "subject": "LYOMERCHANT Expire Transaction",
                "templateData": {
                    "status": "Expired",
                    "invoicenumber": "",
                    "paymentdata": paymentData, "transid": addressObject.id, "storename": "", "network": addressObject.networkDetails[0].network, "coin": addressObject.networkDetails[0].coin, "amount": addressObject.amount
                }
            }
            let emailLog = await emailSending.emailLogs(addressObject.id, emailTemplateName)
            console.log("email_response exipred", emailLog)
            return JSON.stringify(response)
        }
        amountstatus = await amountCheck(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(BalanceOfAddress.data.format_token_balance))
        const hotWallet = await hotWallets.findOne({ "network_id": addressObject.networkDetails[0].id, "status": 1 })
        let GasFee = ""
        if (addressObject.networkDetails[0].libarayType != "btcnetwork") {
            GasFee = await transUtility.calculateGasFee
                (
                    addressObject.networkDetails[0].nodeUrl, addressObject.networkDetails[0].libarayType,
                    addressObject.poolWallet[0].address,
                    hotWallet.address,
                    BalanceOfAddress.data.token_balance,
                    addressObject.networkDetails[0].contractAddress
                )
        }
        if (BalanceOfAddress.data.format_token_balance > 0) {
            let pricecal = await pricecalculation(addressObject.poolWallet[0].network_id, BalanceOfAddress.data.format_token_balance)
            let walletbalance = BalanceOfAddress.status == 200 ? BalanceOfAddress.data.format_token_balance : 0
            let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, walletbalance)
            let transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 1, "amount": BalanceOfAddress.data.format_token_balance } })
            let trans_data = await getTranscationDataForClient(addressObject.id)
            let logData = { "transcationDetails": trans_data[0], "paid_in_usd": pricecal }
            let previouspoolwallet = await poolWallets.findOne({ id: addressObject.poolWallet[0].id })
            let totalBalnce = parseFloat(previouspoolwallet.balance) + walletbalance
            let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { status: 4, balance: totalBalnce } })
            let get_addressObject = await postRequest(addressObject.callbackURL, logData, {})
            let balanceTransfer = addressObject.networkDetails[0].libarayType == "Web3" ? BalanceOfAddress.data.format_native_balance : BalanceOfAddress.data.token_balance
            if (addressObject.networkDetails[0].libarayType != "btcnetwork") {
                let hot_wallet_transcation = await transferUtility.transfer_amount_to_hot_wallet(addressObject.poolWallet[0].id, addressObject.id, balanceTransfer, BalanceOfAddress.data.native_balance, GasFee.data.fee)
            }
            else {
                let btchxwallet = await btchotwallet.insertMany(
                    {
                        id: mongoose.Types.ObjectId(),
                        transid: addressObject.id,
                        pollwalletid: addressObject.poolWallet[0].id,
                        networkid: addressObject.poolWallet[0].network_id,
                        status: 0,
                        created_by: new Date().toString(),
                    }
                )

            }

            var emailTemplateName =
            {
                "emailTemplateName": "successtrans.ejs",
                "to": addressObject.clientdetails[0].email,
                "subject": "LYOMERCHANT Success Transaction",
                "templateData": {
                    "status": "Success",
                    "invoicenumber": "",
                    "transid": addressObject.id,
                    "storename": "",
                    "network": addressObject.networkDetails[0].network,
                    "coin": addressObject.networkDetails[0].coin,
                    "address": "",
                    "amount": addressObject.amount
                }
            }
            let emailLog = await emailSending.emailLogs(addressObject.id, emailTemplateName)
            console.log("email_response success", emailLog)
            response = { amountstatus: 1, "paid_in_usd": pricecal, "paid": BalanceOfAddress.data.format_token_balance, status: 200, message: "Success" };
            return JSON.stringify(response)
        }
        else {
            response = { amountstatus: amountstatus, "paid_in_usd": 0, "paid": BalanceOfAddress.data.format_token_balance, status: 200, message: "Success" };
            return JSON.stringify(response)
        }



    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        response = { amountstatus: 0, "paid": 0, status: 400, message: "error" };
        return JSON.stringify(response)
    }
}

async function verifyTheBalance(transkey) {
    try {
        let transdata = await get_Transcation_topup(transkey)
        let addressObject = transdata[0]
        let response = {}
        var amountstatus = 0
        const previousdate = new Date(parseInt(addressObject.timestamps));
        const currentdate = new Date().getTime()
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
        let remain = parseFloat(addressObject.amount) - parseFloat(BalanceOfAddress.data.format_token_balance)
        let paymentData = { "remain": remain, "paid": BalanceOfAddress.data.format_token_balance, "required": addressObject.amount }

        if (minutes > 180) {
            let transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 4 } })
            let walletbalance = BalanceOfAddress.status == 200 ? BalanceOfAddress.data.format_token_balance : 0
            let previouspoolwallet = await poolWallets.findOne({ id: addressObject.poolWallet[0].id })
            let totalBalnce = parseFloat(previouspoolwallet.balance) + walletbalance
            let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { "status": 3, "balance": totalBalnce } })
            response = { amountstatus: 4, "paymentdata": paymentData, status: 200, "data": {}, message: "Your Transcation is expired." };
            var emailTemplateName =
            {
                "emailTemplateName": "successtrans.ejs",
                "to": addressObject.clientdetails[0].email,
                "subject": "LYOMERCHANT Expire Transaction",
                "templateData": {
                    "status": "Expired",
                    "invoicenumber": "",
                    "paymentdata": paymentData, "transid": addressObject.id, "storename": "", "network": addressObject.networkDetails[0].network, "coin": addressObject.networkDetails[0].coin, "amount": addressObject.amount
                }
            }
            let emailLog = await emailSending.emailLogs(addressObject.id, emailTemplateName)
            console.log("email_response exipred", emailLog)
            return JSON.stringify(response)
        }
        amountstatus = await amountCheck(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(BalanceOfAddress.data.format_token_balance))
        const hotWallet = await hotWallets.findOne({ "network_id": addressObject.networkDetails[0].id, "status": 1 })
        let GasFee = ""
        if (addressObject.networkDetails[0].libarayType != "btcnetwork") {
            GasFee = await transUtility.calculateGasFee
                (
                    addressObject.networkDetails[0].nodeUrl, addressObject.networkDetails[0].libarayType,
                    addressObject.poolWallet[0].address,
                    hotWallet.address,
                    BalanceOfAddress.data.token_balance,
                    addressObject.networkDetails[0].contractAddress
                )
        }
        if (BalanceOfAddress.data.format_token_balance > 0) {
            let pricecal = await pricecalculation(addressObject.poolWallet[0].network_id, BalanceOfAddress.data.format_token_balance)
            let walletbalance = BalanceOfAddress.status == 200 ? BalanceOfAddress.data.format_token_balance : 0
            let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, walletbalance)
            let transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 1, "amount": BalanceOfAddress.data.format_token_balance } })
            let trans_data = await getTranscationDataForClient(addressObject.id)
            let logData = { "transcationDetails": trans_data[0], "paid_in_usd": pricecal }
            let previouspoolwallet = await poolWallets.findOne({ id: addressObject.poolWallet[0].id })
            let totalBalnce = parseFloat(previouspoolwallet.balance) + walletbalance
            let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { status: 4, balance: totalBalnce } })
            let get_addressObject = await postRequest(addressObject.callbackURL, logData, {})
            let balanceTransfer = addressObject.networkDetails[0].libarayType == "Web3" ? BalanceOfAddress.data.format_native_balance : BalanceOfAddress.data.token_balance
            if (addressObject.networkDetails[0].libarayType != "btcnetwork") {
                let hot_wallet_transcation = await transferUtility.transfer_amount_to_hot_wallet(addressObject.poolWallet[0].id, addressObject.id, balanceTransfer, BalanceOfAddress.data.native_balance, GasFee.data.fee)
            }
            else {
                let btchxwallet = await btchotwallet.insertMany(
                    {
                        id: mongoose.Types.ObjectId(),
                        transid: addressObject.id,
                        pollwalletid: addressObject.poolWallet[0].id,
                        networkid: addressObject.poolWallet[0].network_id,
                        status: 0,
                        created_by: new Date().toString(),
                    }
                )

            }

            var emailTemplateName =
            {
                "emailTemplateName": "successtrans.ejs",
                "to": addressObject.clientdetails[0].email,
                "subject": "LYOMERCHANT Success Transaction",
                "templateData": {
                   
                    "status": "Success",
                    "invoicenumber": "",
                    "transid": addressObject.id,
                    "storename": "",
                    "network": addressObject.networkDetails[0].network,
                    "address": addressObject.poolWallet[0].address,
                    "coin": addressObject.networkDetails[0].coin,
                    "amount": BalanceOfAddress.data.format_token_balance
                }
            }
            let emailLog = await emailSending.emailLogs(addressObject.id, emailTemplateName)
            console.log("email_response success", emailLog)
            response = { amountstatus: 1, "paid_in_usd": pricecal, "paid": BalanceOfAddress.data.format_token_balance, status: 200, message: "Success" };
            return JSON.stringify(response)
        }
        else {
            response = { amountstatus: amountstatus, "paid_in_usd": 0, "paid": BalanceOfAddress.data.format_token_balance, status: 200, message: "Success" };
            return JSON.stringify(response)
        }



    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        response = { amountstatus: 0, "paid": 0, status: 400, message: "error" };
        return JSON.stringify(response)
    }
}
module.exports =
{
    get_Transcation_topup : get_Transcation_topup,
    getTrasnsBalance: getTrasnsBalance,
    verifyTheBalance: verifyTheBalance,
}









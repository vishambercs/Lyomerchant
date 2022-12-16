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
const webHookCall = require('../Models/webHookCall');
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
const Topuptranshash = require('../Models/Topuptranshash');
const feedWallets = require('../Models/feedWallets');
const payLink = require('../Models/payLink');
const invoice = require('../Models/invoice');
const btchotwallet = require('../Models/btchotwallet');
const IPNS = require('../Models/IPN');
const topup = require('../Models/topup');
const Fixedtopup = require('../Models/Fixedtopup');
const emailSending = require('./emailSending');
const transUtility = require('./transUtilityFunction');
const fetch = require('node-fetch');
let priceflag = {};
let alreadySetCurrency = [];
async function get_Transcation_topup(transkey) {

    let pooldata = await topup.aggregate(
        [
            { $match: { id: transkey, } },
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

async function get_Fixed_Transcation_topup(transkey) {

    let pooldata = await Fixedtopup.aggregate(
        [
            { $match: { id: transkey, } },
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
const getCoinPrice = async (coin) => {
    if (["LYO", "LYO1"].includes(coin)) {
        try {
            const getBalanceRes = await axios.get(`https://openapi.lyotrade.com/sapi/v1/klines?symbol=LYO1USDT&interval=1min&limit=1`);
            return getBalanceRes.data[0]['close'];
         } catch(e) {
            console.log(e);
            return 1;
         }
    } 
    if (["tUSDT"].includes(coin)) {
        try {
            const getBalanceRes = await axios.get(`https://api.binance.com/api/v3/klines?symbol=USDTUSDT&interval=1m&limit=1`);
            return getBalanceRes.data[0]['close'];
         } catch(e) {
            console.log(e);
            return 1;
         }
    }
    
    else {
        try {
           const getBalanceRes = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${coin}USDT&interval=1m&limit=1`);
           return getBalanceRes.data[0][4];
        } catch(e) {
           console.log(e);
           return 1;
        }
    }
}
const getFiatRates = async (coin) => {
    try {
       const getBalanceRes = await axios.get(`https://www.binance.com/bapi/asset/v1/public/asset-service/product/currency`);
       const rate = await getBalanceRes.data.data.find(element => element.pair.includes(coin)).rate;
       return rate;
    } catch(e) {
       console.log(e);
       return 1;
    }
}
const getRate = async (stablecoin,crypto, fiat) => {
    console.log("========getRate========",stablecoin,crypto, fiat)
    if (stablecoin == true) {
        const fiatRate = await getFiatRates(fiat);
        // return (parseFloat(1)*parseFloat(fiatRate)).toFixed(4);
        return 1
    } else {
        const getCryptoToUsdt = await getCoinPrice(crypto);
        const fiatRate = await getFiatRates(fiat);
        return (parseFloat(getCryptoToUsdt)*parseFloat(fiatRate)).toFixed(4);
    }
}
async function pricecalculation(coinid, balance) {
    try {
        let networks = await network.findOne({ 'id': coinid })
        // let networktitle = networks.currencyid.toLowerCase()
        // let parameters = `ids=${networktitle}&vs_currencies=usd`
        // let COINGECKO_URL = process.env.COINGECKO + parameters
        // response = {}
        // if (!alreadySetCurrency.includes(networktitle)) {
        //     await axios.get(COINGECKO_URL, { params: {}, headers: {} }).then(res => {
        //         var stringify_response = stringify(res)
        //         response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        //     }).catch(error => {
        //         console.error("Error", error)
        //         var stringify_response = stringify(error)
        //         response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        //     })
        //     var stringify_response = JSON.parse(response.data)
        //     let pricedata = stringify_response.data
        //     let pricedatacurrency = pricedata[networktitle]
        //     console.log("stablecoin",networks.stablecoin )
        //     priceflag[networktitle] = networks.stablecoin == true ? 1 : pricedatacurrency["usd"];


        //     alreadySetCurrency.push(networktitle);
        //     setTimeout(() => 
        //     {
        //         alreadySetCurrency.splice(alreadySetCurrency.indexOf(networktitle), 1);
        //     }, 10000);
        // }
        let getRatedata         = await getRate(networks.stablecoin,networks.coin,"USD");
        let price = parseFloat(getRatedata) * parseFloat(balance)
  

        return price;

    }
    catch (error) {
        console.log("pricecalculation", error.message)
        return 1;

    }
}
async function Get_RequestByAxios(URL, parameters, headers) {
    response = {}
    await axios.get(URL, {
        params: parameters,
        headers: headers
    }).then(res => {
        var stringify_response = stringify(res)
        response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
    })
        .catch(error => {
            console.error("Error", error)
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
    return response;
}
async function CheckAddress(Nodeurl, Type, cointype, Address, ContractAddress = "", privateKey = "") {
    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {
        if (Type == "Web3" && cointype == "Token") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            if (ContractAddress != "") {
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
                token_balance = await contract.methods.balanceOf(Address.toLowerCase()).call();
                let decimals = await contract.methods.decimals().call();
                format_token_balance = parseFloat(token_balance) / (1 * 10 ** decimals)
            }
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')

            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if (Type == "Web3" && cointype == "Native") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            let balanceData = { "token_balance": native_balance, "format_token_balance": format_native_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if (Type == "btcnetwork") {

            let url = process.env.BTC_BALANCE_CHECK_URL + Address
            let balance = await Get_RequestByAxios(url, {}, {})
            let balanceData = {}
            let message = ""
            let status = ""
            if (balance.status == 200) {
                let btcaddress = JSON.parse(balance.data).data
                let bal = btcaddress.errorCode == 0 ? +(btcaddress.data.wallet_Balance) : 0.0
                let status = btcaddress.errorCode == 0 ? 200 : 400
                let message = btcaddress.errorCode == 0 ? "sucess" : "error"
                balanceData = { "token_balance": bal, "format_token_balance": bal, "native_balance": bal, "format_native_balance": bal }
                message = "success";
                status = balance.status;
            }
            else {
                balanceData = { "token_balance": 0, "format_token_balance": 0, "native_balance": 0, "format_native_balance": 0 }
                message = "Error";
                status = balance.status;
            }

            return { status: status, data: balanceData, message: message }
        }
        else {
            const HttpProvider      = TronWeb.providers.HttpProvider;
            const fullNode          = new HttpProvider(Nodeurl);
            const solidityNode      = new HttpProvider(Nodeurl);
            const eventServer       = new HttpProvider(Nodeurl);
            const tronWeb           = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            let contract            = await tronWeb.contract().at(ContractAddress);
            native_balance          = await tronWeb.trx.getBalance(Address)
            token_balance           = await contract.balanceOf(Address).call();
            let decimals            = await contract.decimals().call();
            format_token_balance    = tronWeb.toBigNumber(token_balance)
            format_token_balance    = tronWeb.toDecimal(format_token_balance)
            let newformat_balance  = parseFloat(format_token_balance)/parseFloat(`1e${decimals}`)
            format_token_balance = newformat_balance
            let newformat_token_balance         = parseInt(format_token_balance)/parseFloat(`1e${decimals}`)
            format_native_balance               = tronWeb.toBigNumber(native_balance)
            format_native_balance               = tronWeb.toDecimal(format_native_balance)
            format_native_balance               = tronWeb.fromSun(format_native_balance)
            let balanceData                     = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
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
        console.log("==============new val=====================================", clientWallet)
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

            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        })
        .catch(error => {
            var stringify_response = stringify(error)

            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
    return response;
}

async function updateOtherAPI(tx_status, tx_id, toupid, tx_hash, orderid, coin, crypto_amount, fiat_amount, network_id, address, fiat_usd, network_name, createdAt, timestamps) {

    console.log("==============updateOtherAPI=======================",
        tx_status, tx_id, toupid, tx_hash, orderid, coin, crypto_amount, fiat_amount, network_id, address, fiat_usd, network_name, createdAt, timestamps
    )

    var data = '';

    var params = "tx_status=" + tx_status
    params += "&tx_id=" + tx_id
    params += "&toupid=" + toupid
    params += "&tx_hash=" + tx_hash
    params += "&orderid=" + orderid
    params += "&coin=" + coin
    params += "&crypto_amount=" + crypto_amount
    params += "&fiat_amount=" + fiat_amount
    params += "&network_id=" + network_id
    params += "&address=" + address
    params += "&fiat_usd=" + fiat_usd
    params += "&network_name=" + network_name
    params += "&createdAt=" + createdAt
    params += "&timestamps=" + timestamps
    var config = {
        method: 'post',
        url: 'https://api.pulseworld.com:9987/v1/create_tx_records?',
        headers: {},
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log("==============updateOtherAPI=======================", JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log("==============updateOtherAPI=======================", error);
        });

}
async function getTimeprice(time, coin) {
    try {
        const getBalanceRes = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${coin}USDT&interval=1m&startTime=${time}&limit=1`);
        return getBalanceRes.data[0][4];
    } catch (e) {
        console.log(e);
        return 1;
    }
}

let savingIds = [];
async function fetchpostRequest(URL, parameters,id) {
    try {
        let webhooklog = await webHookCall.findOne({trans_id : id})
        let response = {}
        if((webhooklog == null) && (!savingIds.includes(id))){
            savingIds.push(id);
        await axios.post(URL,
            qs.stringify(parameters),
            { headers: {} })
            .then(async (res) => {
                var stringify_response = stringify(res)
                let webhook = await webHookCall.insertMany({
                    id: mongoose.Types.ObjectId(),
                    trans_id:id,
                    status:200,
                    response : stringify_response,
                    created_at: new Date().toString()
                })
                savingIds.splice(savingIds.indexOf(id), 1);
                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
            }).catch(async (error) => {
                var stringify_response = stringify(error)
                let webhook = await webHookCall.insertMany({
                    trans_id:id,
                    status:400,
                    response : error,
                    created_at: new Date().toString()
                })
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
            })
        }
        
        return response;
   
    //     if(webhookcall == null)
    //     {
    //     await fetch(URL,  {
    //         method: 'POST',
    //         body: JSON.stringify(parameters),
    //         headers: { 'Content-Type': 'application/json' }
    //     }).then(res => console.log(res))
    //         .then(json => console.log(json));
    // }
    }
    catch (error) {
        console.log("======================================== fetchpostRequest", error)
    }
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
            addressObject.networkDetails[0].cointype,
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
        let BalanceOfAddress = await CheckAddress(
            addressObject.networkDetails[0].nodeUrl,
            addressObject.networkDetails[0].libarayType,
            addressObject.networkDetails[0].cointype,
            addressObject.poolWallet[0].address,
            addressObject.networkDetails[0].contractAddress,
            addressObject.poolWallet[0].privateKey
        )
        let pricecal = await pricecalculation(addressObject.poolWallet[0].network_id, parseFloat(addressObject.amount) + parseFloat(BalanceOfAddress.data.format_token_balance))
        if (addressObject.transtype == 1) {
            let transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id },
                {
                    $set: {
                        status: 1,
                        "amount": BalanceOfAddress.data.format_token_balance,
                        "fiat_amount": pricecal,
                    }
                }, { returnDocument: 'after' })
        }
        else if (addressObject.transtype == 2) {
            let transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id },
                {
                    $set: 
                    {
                        status          : BalanceOfAddress.data.format_token_balance == addressObject.amount ? 1 : 3,
                        "amount"        : parseFloat(addressObject.amount) + parseFloat(BalanceOfAddress.data.format_token_balance),
                        "crypto_paid"   : parseFloat(addressObject.amount) + parseFloat(BalanceOfAddress.data.format_token_balance),
                        "fiat_amount"   : pricecal,
                    }
                }, { returnDocument: 'after' })
        }

        let remain       = parseFloat(addressObject.fixed_amount) - parseFloat(BalanceOfAddress.data.format_token_balance)

       
        let trans_data          = await getTranscationDataForClient(addressObject.id)
        let logData             = { "transcationDetails": trans_data[0], "paid_in_usd": pricecal }
        let get_addressObject   = await fetchpostRequest(addressObject.callbackURL, logData,addressObject.id)
        let ClientWallet        = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, BalanceOfAddress.data.format_token_balance)
        let paymentData         = { "paid_in_usd" :pricecal ,"remain": remain, "paid": BalanceOfAddress.data.format_token_balance, "required": addressObject.fixed_amount }
        response                = { amountstatus: 0,"paymentData":paymentData, status: 200, message: "success" };
        return JSON.stringify(response)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        let paymentData         = { "pricecal" :0 ,"remain": 0, "paid": 0, "required": 0 }
        response                = { amountstatus: 0,"paymentData":paymentData, status: 400, message: "Error" };
        return JSON.stringify(response)
    }
}

async function verifyTheBalancebyWebsocket(transkey,amount,transhash) {
    try {
        let transdata = await get_Transcation_topup(transkey)
        let addressObject = transdata[0]
        let response = {}
        var amountstatus = 0
     
        let pricecal = await pricecalculation(addressObject.poolWallet[0].network_id, amount)
        var status = 0
        let transhashdata = await Topuptranshash.insertMany({
            transhash : transhash,
            amount : amount,
            topupdetails : addressObject._id,
        })
        let paymenthistory = await Topuptranshash.find({
            topupdetails : addressObject._id,
        })
        let transactionpool = null
       
        if (addressObject.transtype == 1) {
            status = 1
             transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id },
                {
                    $set: {
                        status: 1,
                        "amount":amount,
                        "transhash" : transhash, 
                        "fiat_amount": addressObject.fiat_amount + pricecal,
                        "response_at": new Date().toString(),
                    }
                }, { returnDocument: 'after' })
        }
        else if (addressObject.transtype == 2) 
        {
              
            let netamount = parseFloat(addressObject.crypto_paid) + amount
            status =  netamount == addressObject.fixed_amount ? 1 : status ;
            status =  netamount < addressObject.fixed_amount && netamount > 0 ? 2 : status ;
            status =  netamount > addressObject.fixed_amount && netamount > 0 ? 3 : status ;
             transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id },
                {
                    $set: 
                    {
                        status          : status,
                        "amount"        : netamount,
                        "transhash"     : transhash, 
                        "crypto_paid"   : netamount, 
                        "fiat_amount"   : addressObject.fiat_amount + pricecal,
                        "response_at"   : new Date().toString(),
                    }
                }, { returnDocument: 'after' })
        }
        let remain            = parseFloat(transactionpool.fixed_amount) - parseFloat(transactionpool.crypto_paid)
        let paymentData       = { "paid_in_usd": transactionpool.fiat_amount, "remain": remain, "paid": transactionpool.crypto_paid, "required": transactionpool.fixed_amount }
        let trans_data        = await getTranscationDataForClient(addressObject.id)
        let ClientWallet      = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, amount)
        let logData           = { "transcationDetails": trans_data[0], "paid_in_usd": pricecal }
        let get_addressObject = await fetchpostRequest(addressObject.callbackURL, logData,addressObject.id)
        response              = {transkey: transkey, amountstatus: status, "paymentData":paymentData ,status: 200, message: "success","paymenthistory":paymenthistory };
        return JSON.stringify(response)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        response              = { transkey: transkey,amountstatus: 0, "paymentData":{} ,status: 400, message: "Error","paymenthistory":{} };
        return JSON.stringify(response)
    }
}

async function partialTopupBalance(transkey) {
    try {
        let transdata = await get_Transcation_topup(transkey)
        let addressObject = transdata[0]
        let response = {}
        var amountstatus = 0
        let BalanceOfAddress = await CheckAddress(
            addressObject.networkDetails[0].nodeUrl,
            addressObject.networkDetails[0].libarayType,
            addressObject.networkDetails[0].cointype,
            addressObject.poolWallet[0].address,
            addressObject.networkDetails[0].contractAddress,
            addressObject.poolWallet[0].privateKey
        )
        let pricecal = await pricecalculation(addressObject.poolWallet[0].network_id, parseFloat(addressObject.amount) + parseFloat(BalanceOfAddress.data.format_token_balance))
        let transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id },
            {
                $set: {
                    status: 2,
                    "amount"        : parseFloat(addressObject.amount) + parseFloat(BalanceOfAddress.data.format_token_balance),
                    "crypto_paid"   : parseFloat(addressObject.amount) + parseFloat(BalanceOfAddress.data.format_token_balance),
                    "fiat_amount"   : pricecal,
                }
            }, { returnDocument: 'after' })
        let remain = parseFloat(addressObject.fixed_amount) - parseFloat(BalanceOfAddress.data.format_token_balance)
        let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, BalanceOfAddress.data.format_token_balance)
        let paymentData         = { "paid_in_usd" :pricecal ,"remain": remain, "paid": BalanceOfAddress.data.format_token_balance, "required": addressObject.fixed_amount }
        response                = { amountstatus: 0,"paymentData":paymentData, status: 200, message: "success" };
        return JSON.stringify(response)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        let paymentData         = { "pricecal" :0 ,"remain": 0, "paid": 0, "required": 0 }
        response                = { amountstatus: 0,"paymentData":paymentData, status: 400, message: "Error" };
        return JSON.stringify(response)
    }
}

async function expiredTheBalance(transkey) {
    try {

        let transdata = await get_Transcation_topup(transkey)
        let addressObject = transdata[0]
        let response = {}
        var amountstatus = 0
        let BalanceOfAddress = await CheckAddress(
            addressObject.networkDetails[0].nodeUrl,
            addressObject.networkDetails[0].libarayType,
            addressObject.networkDetails[0].cointype,
            addressObject.poolWallet[0].address,
            addressObject.networkDetails[0].contractAddress,
            addressObject.poolWallet[0].privateKey
        )
        let pricecal = await pricecalculation(addressObject.poolWallet[0].network_id, BalanceOfAddress.data.format_token_balance)
        let transactionpool = await topup.findOneAndUpdate({ 'id': addressObject.id },
            {
                $set: {
                    status: 4,
                    "amount": BalanceOfAddress.data.format_token_balance,
                    
                    "fiat_amount": pricecal,
                }
            }, { returnDocument: 'after' })
        let remain       = parseFloat(addressObject.amount) - parseFloat(BalanceOfAddress.data.format_token_balance)
        let paymentData  = { "remain": remain, "paid": BalanceOfAddress.data.format_token_balance, "required": addressObject.amount }
        let trans_data   = await getTranscationDataForClient(addressObject.id)
        let logData      = { "transcationDetails": trans_data[0], "paid_in_usd": pricecal }
        let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, BalanceOfAddress.data.format_token_balance)
        response         = { amountstatus: 0, "paid_in_use": pricecal, "paid": BalanceOfAddress.data.format_token_balance, status: 200, message: "success" };
        return JSON.stringify(response)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        response = { amountstatus: 0, "paid": 0, status: 400, message: "error" };
        return JSON.stringify(response)
    }
}

async function verifyFixedTheBalance(transkey, status) {
    try {
        let transdata = await get_Fixed_Transcation_topup(transkey)
        let addressObject = transdata[0]
        let response = {}
        var amountstatus = 0
        let BalanceOfAddress = await CheckAddress(
            addressObject.networkDetails[0].nodeUrl,
            addressObject.networkDetails[0].libarayType,
            addressObject.networkDetails[0].cointype,
            addressObject.poolWallet[0].address,
            addressObject.networkDetails[0].contractAddress,
            addressObject.poolWallet[0].privateKey
        )
        let pricecal = await pricecalculation(addressObject.poolWallet[0].network_id, BalanceOfAddress.data.format_token_balance)
        let transactionpool = await Fixedtopup.findOneAndUpdate({ 'id': addressObject.id },
            {
                $set: {
                    status: status,
                    "crypto_paid": BalanceOfAddress.data.format_token_balance,
                    "fiat_amount": pricecal,
                }
            }, { returnDocument: 'after' })

        let remain = parseFloat(addressObject.amount) - parseFloat(BalanceOfAddress.data.format_token_balance)
        let paymentData = { "remain": remain, "paid": BalanceOfAddress.data.format_token_balance, "required": addressObject.amount }
        let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, BalanceOfAddress.data.format_token_balance)
        
        response = { amountstatus: 0, "paid_in_use": pricecal, "paid": BalanceOfAddress.data.format_token_balance, status: 200, message: "success" };
        return JSON.stringify(response)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        response = { amountstatus: 0, "paid": 0, status: 400, message: "error" };
        return JSON.stringify(response)
    }
}

async function partialFixedTheBalance(transkey) {
    try {
        let transdata = await get_Fixed_Transcation_topup(transkey)
        let addressObject = transdata[0]
        let response = {}
        var amountstatus = 0
        let BalanceOfAddress = await CheckAddress(
            addressObject.networkDetails[0].nodeUrl,
            addressObject.networkDetails[0].libarayType,
            addressObject.networkDetails[0].cointype,
            addressObject.poolWallet[0].address,
            addressObject.networkDetails[0].contractAddress,
            addressObject.poolWallet[0].privateKey
        )
        let pricecal = await pricecalculation(addressObject.poolWallet[0].network_id, BalanceOfAddress.data.format_token_balance)
       
        let transactionpool = await Fixedtopup.findOneAndUpdate({ 'id': addressObject.id },
            {
                $set: {
                    status: 2,
                    "crypto_paid": BalanceOfAddress.data.format_token_balance,
                    "fiat_amount": pricecal,
                }
            }, { returnDocument: 'after' })

        let remain = parseFloat(addressObject.amount) - parseFloat(BalanceOfAddress.data.format_token_balance)
        let paymentData = { "remain": remain, "paid": BalanceOfAddress.data.format_token_balance, "required": addressObject.amount }
        let ClientWallet = await updateClientWallet(addressObject.api_key, addressObject.networkDetails[0].id, BalanceOfAddress.data.format_token_balance)
        response = { amountstatus: 0, "paid_in_use": pricecal, "paid": BalanceOfAddress.data.format_token_balance, status: 200, message: "success" };
        return JSON.stringify(response)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        response = { amountstatus: 0, "paid": 0, status: 400, message: "error" };
        return JSON.stringify(response)
    }
}
module.exports =
{
    pricection    : pricecalculation,
    verifyTheBalancebyWebsocket :verifyTheBalancebyWebsocket,
    get_Transcation_topup: get_Transcation_topup,
    getTrasnsBalance: getTrasnsBalance,
    verifyTheBalance: verifyTheBalance,
    expiredTheBalance: expiredTheBalance,
    verifyFixedTheBalance: verifyFixedTheBalance,
    partialFixedTheBalance: partialFixedTheBalance,
    partialTopupBalance: partialTopupBalance,
}









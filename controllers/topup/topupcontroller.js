const topup = require('../../Models/topup');
const poolWallet = require('../../Models/poolWallet');
const networks = require('../../Models/network');
const Constant = require('../../common/Constant');
var otpGenerator = require('otp-generator')
var mongoose = require('mongoose');
var poolwalletController = require('../poolwalletController');
const clientWallets = require('../../Models/clientWallets');
const Web3 = require('web3');
const TronWeb = require('tronweb')
const axios          = require('axios')
const fetch = require('node-fetch');
var stringify = require('json-stringify-safe');
async function CheckAddress(Nodeurl, Type,cointype ,Address, ContractAddress = "", privateKey = "") {
   
    
    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {
        if (Type == "Web3" &&  cointype == "Token"   ) {
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
        else if (Type == "Web3" &&  cointype == "Native") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            let balanceData = { "token_balance": native_balance, "format_token_balance": format_native_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
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

async function pricecalculation(networktitle,balance) {
    try {
        let parameters       = `ids=${networktitle}&vs_currencies=usd`
        let COINGECKO_URL    = process.env.COINGECKO + parameters
        response             = {}
        await axios.get(COINGECKO_URL, { params: {},headers: {}}).then(res => {
            var stringify_response = stringify(res)
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        }).catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
        var stringify_response = JSON.parse(response.data)
        let pricedata = stringify_response.data
        console.log(pricedata)
        let pricedatacurrency           = pricedata[networktitle]
        let price                       = parseFloat(pricedatacurrency["usd"]) * parseFloat(balance)
        return price;
    }
    catch (error) {
        console.log("pricecalculation", error)
        return 0;

    }
}
async function updateClientWallet(client_api_key, networkid, merchantbalance, processingfee = 0.01) {
    let val = await clientWallets.findOne({ client_api_key: client_api_key, network_id: networkid,status: 1 })
    if (val != null) 
    {
        let clientWallet = await clientWallets.updateOne({ client_api_key: client_api_key, network_id: networkid }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * processingfee))) } })
        return clientWallet
    }
    else 
    {
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
        console.log("==============new val=====================================",clientWallet )
        return client_Wallet
    }
}
async function fetchpostRequest(URL, parameters) {
    try
    {
    await fetch(URL, {
        method: 'POST',
        body: JSON.stringify(parameters),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => console.log(res))
      .then(json => console.log(json));
    }
    catch(error){
        console.log("======================================== fetchpostRequest",error)
    }
}
module.exports =
{
    
    async create_top_payment(req, res) {
        try {
            var merchantKey = req.headers.authorization
            var networkType = req.body.networkType
            var orderid = req.body.orderid
            let currentDateTemp = Date.now();
            let currentDate = parseInt((currentDateTemp / 1000).toFixed());
            let account = await poolwalletController.getPoolWalletID(networkType)
            const transactionPool = new topup({
                id  : mongoose.Types.ObjectId(),
                api_key: req.headers.authorization,
                poolwalletID: account.id,
                amount: 0,
                currency: req.body.currency,
                callbackURL: req.body.callbackurl,
                apiredirectURL: req.body.apiredirecturl,
                errorurl: req.body.errorurl,
                orderid: req.body.orderid,
                status: 0,
                walletValidity: currentDate,
                remarks: req.body.remarks,
                timestamps: new Date().getTime()
            });
            transactionPool.save().then(async (val) => {
                await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                let url = process.env.TOP_UP_URL + val.id
                
                let data = { url: url }
                res.json({ status: 200, message: "Assigned Merchant Wallet Successfully", data: data })
            }).catch(error => {
                console.log("error", error)
                res.json({ status: 400, data: {}, message: "Please Contact Admin" })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async get_top_payment_data(req, res) {
        try {
            let transactionPool = await topup.findOne({ id: req.body.id , status : 0 })
           
            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })
          
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network = await networks.findOne({ id: transWallet.network_id })
            let data =
            {
                transactionID   : transactionPool.id,
                address         : transWallet.address,
                walletValidity  : transactionPool.walletValidity,
                amount          : transactionPool.amount,
                key             : transactionPool.api_key,
                apiredirecturl  : transactionPool.apiredirectURL,
                callbackURL     : transactionPool.callbackURL,
                errorurl        : transactionPool.errorurl,
                orderid         : transactionPool.orderid,
                network         : network.network,
                coin            : network.coin
            }
            res.json({ status: 200, message: "Get The Data", data: data })


        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async cancelpaymentLink(req, res) {
        try {
            let tranPool     = await topup.findOne({id  : req.body.id })
            if(tranPool == null)
            {
               return  res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transactionPool = await topup.findOneAndUpdate({ 'id':tranPool.id  }, { $set: { "status" : 5 , "remarks" : "By Client Canceled" , "canceled_at" : new Date().toString() }} ,{ returnDocument: 'after' })
            let data = 
            { 
                transactionID: transactionPool.id, 
                orderid     : transactionPool.orderid,
            }
            res.json({ status: 200, message: "Get The Data", data: data })

            
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    }, 
    async checkbalance(req, res) 
    {
        try {
            let transactionPool = await topup.findOne({ id: req.body.id })
            
            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })
            
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network = await networks.findOne({ id: transWallet.network_id })
            
            let balance =  await CheckAddress(
                network.nodeUrl, 
                network.libarayType,
                network.cointype,
                transWallet.address, 
                network.contractAddress,  
                transWallet.privateKey
                ) 
               
            let statusdata =   Constant.transstatus.filter(index => index.id ==transactionPool.status)
            let data =
            {
                transactionID   : transactionPool.id,
                address         : transWallet.address,
                walletValidity  : transactionPool.walletValidity,
                amount          : transactionPool.amount,
                key             : transactionPool.api_key,
                status          : transactionPool.status,
                statustitle     : statusdata,
                apiredirecturl  : transactionPool.apiredirectURL,
                callbackURL     : transactionPool.callbackURL,
                errorurl        : transactionPool.errorurl,
                orderid         : transactionPool.orderid,
                network         : network.network,
                coin            : network.coin,
                balance         : balance,
            }
            res.json({ status: 200, message: "Get The Data", data: data })
            
        }
        catch (error) {
            console.log("checkbalance",error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },  
    async verifyTheBalance(req,res) {
        try 
        {
            let balance     = +(req.body.balance)
            let status      =  req.body.status
            let pw          = await poolWallet.findOne({ 'address': req.body.address,status:1 })
            if(pw   ==  null)
            {
               return res.json({ status: 400, data: {}, message: "Invalid Request" })
            }
            let topitem = await topup.findOne({ poolwalletID: pw.id, status: 0 })
            if(topitem ==  null)
            {
               return res.json({ status: 400, data: {}, message: "Invalid Request" })
            }
            let network             = await networks.findOne({ id: pw.network_id })
            let networktitle        = network.currencyid.toLowerCase()
            let price               = await pricecalculation(networktitle,balance) 
            let updatetopup         = await topup.updateOne({ id: topitem.id}, { $set:{
                amount              : balance,
                fiat_amount         : price, 
                status              : status,
                api_updated_at      : new Date().toString()
            }},{'returnDocument'    : 'after'})
            let updatebalance       = await updateClientWallet( topitem.api_key, balance,network.processingfee)
            let updatepoolwallet    = await poolWallet.updateOne({'id': pw.id},{$set:{ status:20 } })
            var index               = Constant.topupTransList.findIndex(translist => translist.transkey == topitem.id)
            
            if(index != -1 && status == 1)
            {
               const transData      = Constant.topupTransList[index]
                let response        = 
                { 
                    transkey:topitem.id ,
                    amountstatus: status,
                    "paid_in_usd":price, 
                    "paid": balance, 
                    status: 200, 
                    message: "Success" 
                };
                transData.connection.sendUTF(JSON.stringify(response));
                transData.connection.close(1000)
                Constant.topupTransList =  Constant.topupTransList.filter(translist => translist.transkey != topitem.id);
                let get_addressObject = await fetchpostRequest(topitem.callbackURL, updatetopup)
            }
            else
            {
                const transData      = Constant.topupTransList[index]
                let response = 
                { 
                    transkey:topitem.id ,
                    amountstatus: status,
                    "paid_in_usd":price, 
                    "paid": balance, 
                    status: 200, 
                    message: "Success" 
                };
                transData.connection.sendUTF(JSON.stringify(response));
                transData.connection.close(1000)
            }

            res.json({ status: 200, data: {}, message: "Thanks I am updating" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    
            } 
}




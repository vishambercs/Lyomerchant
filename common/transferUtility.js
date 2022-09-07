
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
        let amount = balance * 1000000
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider(nodeUrl);
        const solidityNode = new HttpProvider(nodeUrl);
        const eventServer = new HttpProvider(nodeUrl);
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
        let contract = await tronWeb.contract().at(contractAddress);
        let hash = await contract.transfer(toaddress, amount).send({ feeLimit: gas })
        return { status: 200, message: "Pool Wallet", data: hash }
    }
    catch (error) {
        console.log("transfertokenWeb3", error)
        return { status: 400, data: "", message: error }
    }
}

async function check_Status_Feeding_Transcation(nodeUrl, libarayType, privateKey, tranxid) {
    try 
    {
            if(libarayType == "Tronweb")
            {
            const HttpProvider  = TronWeb.providers.HttpProvider;
            const fullNode      = new HttpProvider(nodeUrl);
            const solidityNode  = new HttpProvider(nodeUrl);
            const eventServer = new HttpProvider(nodeUrl);
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            let  getConfirmedTransc = await tronWeb.trx.getConfirmedTransaction(tranxid);
            let UnconfirmedTransactionInfo = tronWeb.trx.getUnconfirmedTransactionInfo(tranxid)
            let datavalues = {"confirm":getConfirmedTransc,"Unconfirm":UnconfirmedTransactionInfo,}
            return { status: 200, message: "Get Feeding Wallet Transcation Status", data: datavalues }
            }
            else
            {
                let datavalues = {"confirm":{},"Unconfirm":{}}
                return { status: 200, message: "Get Feeding Wallet Transcation Status", data: datavalues }
            }
        }
    catch (error) 
    {
        console.log("check_Status_Feeding_Transcation", error)
        return { status: 400, data:{}, message: "Error" }
    }
}

async function CheckBalanceOfAddress(Nodeurl, Type, Address, ContractAddress = "", privateKey = "") {
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
    }
    catch (error) {
        console.log(error)
        let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
        return { status: 400, data: balanceData, message: "Error" }
    }
}

module.exports =
{
    transfertokenWeb3                   :   transfertokenWeb3,
    transfertokenTronWeb                :   transfertokenTronWeb,
    check_Status_Feeding_Transcation    :   check_Status_Feeding_Transcation,
    CheckBalanceOfAddress               :   CheckBalanceOfAddress,
}
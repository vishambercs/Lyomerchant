const ejs = require('ejs');
const fs = require('fs');
const Web3 = require('web3');

var stringify = require('json-stringify-safe');
const transcationLog = require('../Models/transcationLog');
const network = require('../Models/network');
var qs = require('qs');
const axios = require('axios')
const Constant = require('./Constant');
const transferUtility = require('./transferUtility');
const Utility = require('./Utility');
const clientWallets = require('../Models/clientWallets');
const poolWallets = require('../Models/poolWallet');
const transactionPools = require('../Models/transactionPool');
const paymentLinkTransactionPool = require('../Models/paymentLinkTransactionPool');
const clients = require('../Models/clients');
const hotWallets = require('../Models/hotWallets');
const hot_wallet_trans_logs = require('../Models/hot_wallet_trans_logs');
require("dotenv").config()
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const TronWeb = require('tronweb')
const posTransactionPool = require('../Models/posTransactionPool');
const transporter = nodemailer.createTransport({ host: "srv.lyotechlabs.com", port: 465, auth: { user: "no-reply@email.lyomerchant.com", pass: "1gbA=0pVVJcS", } });
const transUtility = require('./transUtilityFunction');

const payLinkUtility = require('./payLinkUtility');
const feedWalletController = require('../controllers/Masters/feedWalletController');


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

async function getTranscationData(transkey) {

    let pooldata = await transactionPools.aggregate(
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

async function getBalance(transdata, transData) {
    try {
        let addressObject = transdata[0]
        let response = {}
        let account_balance_in_ether = 0
        let account_balance = 0
        var amountstatus = 0
        let merchantbalance = 0;
        const previousdate = new Date(parseInt(addressObject.timestamps));
        const currentdate = new Date().getTime()
        var diff = currentdate - previousdate.getTime();
        var minutes = (diff / 60000)
     
        if (minutes > 10) 
        {
            let transactionpool = await transactionPools.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": 4 } })
            let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { "status": 3 } })
            response = { amountstatus: 4, status: 200, "data": {}, message: "Your Transcation is expired." };
            return JSON.stringify(response)
        }

        let BalanceOfAddress = await transUtility.CheckBalanceOfAddress(
            addressObject.networkDetails[0].nodeUrl,
            addressObject.networkDetails[0].libarayType,
            addressObject.poolWallet[0].address,
            addressObject.networkDetails[0].contractAddress,
            addressObject.poolWallet[0].privateKey
        )
       
        amountstatus = await amountCheck(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(BalanceOfAddress.data.format_token_balance))
        
        const hotWallet = await hotWallets.findOne({ "network_id": addressObject.networkDetails[0].id, "status": 1 })
        let GasFee      =  await transUtility.calculateGasFee
        (
            addressObject.networkDetails[0].nodeUrl, addressObject.networkDetails[0].libarayType, 
            addressObject.poolWallet[0].address, 
            hotWallet.address, 
            BalanceOfAddress.data.token_balance,
            addressObject.networkDetails[0].contractAddress
        ) 
       
        if (amountstatus != 0) 
        {
            let walletbalance               = BalanceOfAddress.status == 200 ? BalanceOfAddress.data.format_token_balance : 0
            let ClientWallet                = await updateClientWallet(addressObject.api_key ,  addressObject.networkDetails[0].id,walletbalance)
            let transactionpool             = await transactionPools.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": amountstatus } })
            let get_transcation_response    = await getTranscationList(addressObject.poolWallet[0].address, addressObject.id, addressObject.networkDetails[0].id)
            let trans_data                  = await getTranscationDataForClient(addressObject.id)
            let logData                     = { "transcationDetails": trans_data[0] }
            let previouspoolwallet          = await poolWallets.findOne({ id: addressObject.poolWallet[0].id })
            if(previouspoolwallet != null)
            {
                let totalBalnce = parseFloat(previouspoolwallet.balance) + walletbalance
                let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { balance: totalBalnce } })
            }
            
            if (amountstatus == 1 || amountstatus == 3) 
            {
                let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolWallet[0].id }, { $set: { status: 4 } })  
                let get_addressObject = await postRequest(addressObject.callbackURL, logData, {})
                let balanceTransfer = addressObject.networkDetails[0].libarayType == "Web3" ? BalanceOfAddress.data.format_native_balance : BalanceOfAddress.data.token_balance 
                let hot_wallet_transcation = await transferUtility.transfer_amount_to_hot_wallet(addressObject.poolWallet[0].id, addressObject.id, balanceTransfer, BalanceOfAddress.data.native_balance,GasFee.data.fee)
                 
            }
            response = { amountstatus: amountstatus, status: 200, "data": logData, message: "Success" };
        }
        else 
        {
            let trans_data = await getTranscationDataForClient(addressObject.id)
            let logData = { "transcationDetails": trans_data.length  > 0 ? trans_data[0] : {} }
            response = { amountstatus: amountstatus, status: 200, "data": {"logData":logData,"token_balance" : 0 ,"format_native_balance" : 0 ,"format_token_balance" : 0 , "native_balance" : 0} , message: "Success" };
        }
        return JSON.stringify(response)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        respone = { status: 400, data: {}, message: "Please Contact Admin" }
        return JSON.stringify(respone)
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
async function getTranscationList(address, trans_id, network_id) {
    response = {}
    
    // let network_details = await network.findOne({ id: network_id })
    // var URL = network_details.transcationurl
    // if (network_details.cointype == "Token") {
    //     URL += "?module=account&action=tokentx&address=" + address;
    //     URL += "&contractaddress=" + network_details.contractAddress;
    //     URL += "&startblock=" + network_details.latest_block_number
    //     URL += "&endblock=" + "latest"
    //     URL += "&sort=" + "desc"
    //     URL += "&apikey=" + network_details.apiKey
    // }
    // else {
    //     URL += "?module=account&action=txlist&address=" + address;
    //     URL += "&startblock=" + network_details.latest_block_number
    //     URL += "&endblock=" + "latest"
    //     URL += "&sort=" + "desc"
    //     URL += "&apikey=" + network_details.apiKey
    // }
    // await axios.get(URL, {
    //     params: {},
    //     headers: {}
    // }).then(async (res) => {
    //     var stringify_response = stringify(res)
    //     console.log("res.data.result   ", res.data.result)
    //     if (res.data.result.length > 0) {
    //         console.log("Inside IF", res.data.result.length)
    //         res.data.result.forEach(async (element) => {
    //             let transcationLogData = await transcationLog.findOne({ hash: element['hash'] })
    //             if (transcationLogData == null) {
    //                 element["amount"] = await Web3.utils.fromWei(element["value"], 'ether')
    //                 element["scanurl"] = network_details.scanurl + element["hash"]
    //                 element["trans_pool_id"] = trans_id
    //                 console.log("Error   =", element)
    //                 let transcationLogs = await transcationLog.insertMany(element)
    //                 let network_update = await network.updateOne({ id: network_id }, { $set: { latest_block_number: element["blockNumber"] } })
    //             }
    //         });
    //     }
    //     response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
    // }).catch(error => {
    //     console.log("error   ====", error)
    //     var stringify_response = stringify(error)
    //     response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
    // })
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
        let txStatus = false;
        console.log("account_balance  =", account_balance)
        const from_wallet = await poolWallets.aggregate(
            [
                { $match: { "id": poolwalletID } },
                { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "walletNetwork" } },
        ])
        const hotWallet = await hotWallets.findOne({ "network_id": from_wallet[0].network_id, "status": 1 })
        if (from_wallet[0].walletNetwork[0].hotwallettranscationstatus == false) {
            savelogs(merchant_trans_id, hotWallet.id, " ", from_wallet[0].network_id, 1, "Now this network is manual transfer from..")
        }
        else if (hotWallet != null) {
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
                        // const poolWallet = await poolWallets.updateOne({id : from_wallet[0].id } , {$set:{ balance : (account_balance - from_wallet[0].balance) }})
                        const poolWallet = await poolWallets.updateOne({id : from_wallet[0].id } , { $set:{ balance : 0 , status : 0}})
                        console.log("your transaction:", stringify(hash))
                        web3.eth.getTransaction((hash), (err, res) => {            //getTransactionReceipt
                            if (err) {
                                console.log("error in tx receipt", err)
                            } else {
                                console.log("transaction status", res.status)
                                txStatus = res.status
                            }
                        })
                        if (txStatus == true) {
                        //const poolWallet = await poolWallets.updateOne({id : from_wallet[0].id } , {$set:{ balance : (account_balance - from_wallet[0].balance) }})
                        const poolWallet = await poolWallets.updateOne({ id: from_wallet[0].id }, { $set: { balance: 0, status: 0 } })
                        console.log("your transaction:", poolWallet)
                        return JSON.stringify({ status: 200, message: "Pool Wallet", data: hash })
                        }
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
                let result23 = await tronWeb.trx.getBalance(from_wallet[0].address)
                let account_balance_in_ether = await tronWeb.trx.getBalance(from_wallet[0].address)
                let result = await contract.balanceOf(from_wallet[0].address).call();
                //const { abi }        = await tronWeb.trx.getContract(from_wallet[0].walletNetwork[0].contractAddress);
                //const sendcontract   = tronWeb.contract(abi.entrys, from_wallet[0].walletNetwork[0].contractAddress);
                //let result345        = await contract.transfer(hotWallet.address, result).send({ feeLimit: 10000000000 })
                // const poolWallet  = await poolWallets.updateOne({id : from_wallet[0].id } , {$set:{ balance : ( account_balance - from_wallet[0].balance ) }})
                const poolWallet     = await poolWallets.updateOne({id : from_wallet[0].id } , {$set:{ balance : 0 , status : 0 }})
                const { abi } = await tronWeb.trx.getContract(from_wallet[0].walletNetwork[0].contractAddress);
                const sendcontract = tronWeb.contract(abi.entrys, from_wallet[0].walletNetwork[0].contractAddress);
                let result345 = await contract.transfer(hotWallet.address, account_balance).send({ feeLimit: 10000000000 })
                //const poolWallet = await poolWallets.updateOne({id : from_wallet[0].id } , {$set:{ balance : ( account_balance - from_wallet[0].balance ) }})
                //const poolWallet = await poolWallets.updateOne({id : from_wallet[0].id } , {$set:{ balance : 0 }})
                // const poolWallet  = await poolWallets.updateOne({id : from_wallet[0].id } , {$set:{ balance : ( account_balance - from_wallet[0].balance ) }})
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

module.exports =
{
    
    async Get_Transcation_List(address, trans_id, network_id) {
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
                res.data.result.forEach(async (element) => {
                    element["amount"] = await Web3.utils.fromWei(element["value"], 'ether')
                    element["scanurl"] = network_details.scanurl + element["hash"]
                    element["trans_pool_id"] = trans_id
                    let transcationLogs = await transcationLog.insertMany(element)
                    let network_update = await network.updateOne({ id: network_id }, { $set: { latest_block_number: element["blockNumber"] } })
                });
            }
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        }).catch(error => {
            // console.error("Error  =", error)
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
        return response;
    },
    async amount_check(previous, need, current) {
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
    },

    async transaction_DataForClient(transKey) {
        getTranscationDataForClient(transKey)
    },

    async remaining_balance(previous, need, current) {
        console.log("remaining_balance  ", current - previous)
        console.log("remaining_balance  ", need)
        console.log("remaining_balance  ", need - (current - previous))
        var remaining = need - (current - previous)
        return remaining

    },
    async get_Request(callbackURL) {
        let response = {}
        await axios.get(callbackURL, {
            params: {},
            headers: {}
        }).then(res => {
            var stringify_response = stringify(res)
            response = { status: 200, data: res, message: "Get The Data From URL" }
        }).catch(error => {
            response = { status: 404, data: error, message: "There is an error.Please Check Logs." };
        })
        return response
    },
    async Get_Request_FOR_KYC(URL, headers) {
        let response = {}
        await axios.get(URL, { headers: headers })
            .then(res => {
                var stringify_response = stringify(res)
                
                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
            })
            .catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
            })
        return response;


    },
    async Post_Request(URL, parameters, headers) {
        let response = {}

        await axios.post(URL,
            qs.stringify(parameters),
            { headers: headers })
            .then(res => {
                var stringify_response = stringify(res)
            
                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
            })
            .catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
            console.log(error.config)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
            })
        return response;


    },
    async Get_Request(URL, parameters, headers) {
        let response = {}

        await axios.get(URL,
            qs.stringify(parameters),
            { headers: headers })
            .then(res => {
                var stringify_response = stringify(res)
            
                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
            })
            .catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
            })
        return response;


    },
    async get_Transcation_Data(transkey) {

        let pooldata = await transactionPools.aggregate(
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
                        "poolWallet.privateKey": 0,
                        "poolWallet.id": 0,
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
    },
    async get_Transcation_Pos_Data(transkey) {

        let pooldata = await posTransactionPool.aggregate(
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
                        "poolWallet.privateKey": 0,
                        "poolWallet.id": 0,
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
    },
    async get_data_of_transcation() {

        if (Constant.index < Constant.translists.length) {
            let transData = Constant.translists[Constant.index]
            let transcationData = await getTranscationData(transData.transkey)
            let balance_data = await getBalance(transcationData, transData)
            let balanceResponse = JSON.parse(balance_data)
            if (balanceResponse.amountstatus == 1 || balanceResponse.amountstatus == 3 || balanceResponse.amountstatus == 4) {
                transData.connection.sendUTF(JSON.stringify(balanceResponse));
                transData.connection.close(1000)
                Constant.translists = await Constant.translists.filter(translist => translist.transkey != transData.transkey);
            }
            else {
                transData.connection.sendUTF(JSON.stringify(balanceResponse));
            }
            Constant.index = Constant.index + 1
        }
        else {
            Constant.index = 0;
        }
    },
    async get_data_approvekyc() {
        if (Constant.kycindex < Constant.kycapplication.length) {
            let transData = Constant.kycapplication[Constant.kycindex]
            let transcationData = await clients.find({ "api_key": transData.api_key, "status": true })
            if (transcationData.length > 0) {
                transData.connection.sendUTF(JSON.stringify({ status: 200, result: true }));
                transData.connection.close(1000)
                Constant.kycapplication = await Constant.kycapplication.filter(translist => translist.api_key != transData.api_key);
            }
            else {
                transData.connection.sendUTF(JSON.stringify({ status: 200, result: false }));
            }

            Constant.kycindex = Constant.kycindex + 1
        }
        else {
            Constant.kycindex = 0;
        }
    },
    async sendEmailFunction(paramters) {
        try {
            let respone = {}
            let views = "./views/emailtemplate/" + paramters.emailTemplateName
            let info = transporter.sendMail
                ({
                    from: process.env.FROM,
                    to: paramters.to,
                    subject: paramters.subject,
                    html: ejs.render(fs.readFileSync(views, 'utf-8'), { "data": paramters.templateData }),
                },
                    function (error, info) {
                        if (error) {
                            console.log("Message error", error);
                            respone = { status: 400, data: info, message: error }
                        } else {
                            console.log("Message %s sent: %s", info.messageId, info);
                            respone = { status: 200, data: info, message: "Get The Data" }
                        }
                    });
            return JSON.stringify(respone)
        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            respone = { status: 400, data: {}, message: error.message }
            return JSON.stringify(respone)
        }


    },
    async get_data_of_Pos_transcation() {
        if (Constant.postransindex < Constant.posTransList.length) {
            let transData = Constant.posTransList[Constant.postransindex]
            let transcationData = await transUtility.getPosTranscationData(transData.transkey)
            let balance_data = await transUtility.getTrasnsBalance(transcationData)
            let balanceResponse = JSON.parse(balance_data)
            console.log("get_data_of_Pos_transcation      ==", balanceResponse);
            if (balanceResponse.amountstatus == 1 || balanceResponse.amountstatus == 3 || balanceResponse.amountstatus == 4) {
                transData.connection.sendUTF(JSON.stringify(balanceResponse));
                transData.connection.close(1000)
                Constant.posTransList = await Constant.posTransList.filter(translist => translist.transkey != transData.transkey);
            }
            else {
                transData.connection.sendUTF(JSON.stringify(balanceResponse));
            }
            Constant.postransindex = Constant.postransindex + 1
        }
        else {
            Constant.postransindex = 0;
        }
    },
    async get_Transcation_Paylink_Data(transkey) {

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
                        "poolWallet.privateKey": 0,
                        "poolWallet.id": 0,
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
    },
    async get_data_of_Paymentlink_transcation() 
    {
        if (Constant.paymenlinkIndex < Constant.paymenlinkTransList.length) {
            let transData = Constant.paymenlinkTransList[Constant.paymenlinkIndex]
            let transcationData = await payLinkUtility.get_Transcation_Paylink_Data(transData.transkey)
            let balance_data    = await payLinkUtility.getTrasnsBalance(transcationData)
            let balanceResponse = JSON.parse(balance_data)
            console.log("get_data_of_Paymentlink_transcation balanceResponse",balanceResponse)
            if (balanceResponse.amountstatus == 1 || balanceResponse.amountstatus == 3 || balanceResponse.amountstatus == 4) {
                transData.connection.sendUTF(JSON.stringify(balanceResponse));
                transData.connection.close(1000)
                Constant.paymenlinkTransList = await Constant.paymenlinkTransList.filter(translist => translist.transkey != transData.transkey);
            }
            else 
            {
                transData.connection.sendUTF(JSON.stringify(balanceResponse));
            }
            Constant.paymenlinkIndex = Constant.paymenlinkIndex + 1
        }
        else {
            Constant.paymenlinkIndex = 0;
        }
    },
    
}

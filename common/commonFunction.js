const ejs = require('ejs');
const fs = require('fs');
const Web3 = require('web3');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const constant = require('./Constant');
const transcationLog = require('../Models/transcationLog');
const network = require('../Models/network');
var qs = require('qs');
const Constant = require('./Constant');
const Utility = require('./Utility');
const clientWallets = require('../Models/clientWallets');
const poolWallets = require('../Models/poolWallet');
const transactionPools = require('../Models/transactionPool');
const clients = require('../Models/clients');
require("dotenv").config()
var nodemailer          = require('nodemailer');

const transporter       = nodemailer.createTransport({ host:"srv.lyotechlabs.com", port: 465, auth: { user: "no-reply@email.lyomerchant.com", pass: "1gbA=0pVVJcS", }});

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
    let addressObject = transdata[0]
    let response = {}
    let account_balance_in_ether = 0
    const WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject.networkDetails[0].nodeUrl))
    if (addressObject.networkDetails[0].cointype == "Token") {
        let abi = [
            {
                constant: true,
                inputs: [{ name: "_owner", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "balance", type: "uint256" }],
                type: "function",
            },
        ];
        const contract = new WEB3.eth.Contract(abi, addressObject.networkDetails[0].contractAddress);
        let result = await contract.methods.balanceOf(addressObject.poolWallet[0].address).call();
        account_balance_in_ether = await WEB3.utils.fromWei(result.toString());
        console.log("account_balance_in_ether Token", account_balance_in_ether)
    }
    else if (addressObject.networkDetails[0].cointype == "Native") {
        let account_balance = await BSC_WEB3.eth.getBalance(addressObject.poolWallet[0].address.toLowerCase())
        account_balance_in_ether = await Web3.utils.fromWei(account_balance.toString(), 'ether')
        console.log("account_balance_in_ether Native", account_balance_in_ether)
    }
    let merchantbalance = account_balance_in_ether - addressObject.poolWallet[0].balance
    var amountstatus = await amountCheck(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), account_balance_in_ether)
    console.log(amountstatus)
    console.log("merchantbalance merchantbalance", merchantbalance)
    console.log("merchantbalance addressObject.poolWallet[0].balance", addressObject.poolWallet[0].balance)
    console.log("merchantbalance addressObject.amount ", addressObject.amount)
    console.log("merchantbalance account_balance_in_ether", account_balance_in_ether)
    console.log("merchantbalance poolWallet", addressObject.poolWallet)
    if (amountstatus != 0) {
        let val = await clientWallets.findOne({ api_key: addressObject.api_key, network_id: addressObject.networkDetails[0].id })
        let clientWallet = await clientWallets.updateOne({ api_key: addressObject.api_key, network_id: addressObject.networkDetails[0].id }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * 0.01))) } })
        let transactionpool = await transactionPools.findOneAndUpdate({ 'id': addressObject.id }, { $set: { "status": amountstatus } })
        let poolwallet = await poolWallets.findOneAndUpdate({ id: addressObject.poolwalletID }, { $set: { status: ((amountstatus == 1 || amountstatus == 3) ? 0 : 1), balance: ((amountstatus == 1 || amountstatus == 3) ? account_balance_in_ether : addressObject.poolWallet[0].balance) } })
        let get_transcation_response = await getTranscationList(addressObject.poolWallet[0].address, addressObject.id, addressObject.networkDetails[0].id)
        let trans_data = await getTranscationDataForClient(addressObject.id)
        let logData = { "transcationDetails": trans_data[0] }
        if (amountstatus == 1 || amountstatus == 3) {
            let get_addressObject = await postRequest(addressObject.callbackURL, logData, {})
            console.log(get_addressObject)
        }
        response = { amountstatus: amountstatus, status: 200, "data": logData, };
    }
    else {
        let trans_data = await getTranscationDataForClient(addressObject.id)
        let logData = { "transcationDetails": trans_data[0] }
        response = { amountstatus: amountstatus, status: 200, "data": logData, };
    }
    return JSON.stringify(response)
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
        console.log("res.data.result=====================", res.data.result)
        if (res.data.result.length > 0) {
            console.log("Inside IF", res.data.result.length)
            res.data.result.forEach(async (element) => {
                let transcationLogData = await transcationLog.findOne({ hash: element['hash'] })

                if (transcationLogData == null) {

                    element["amount"] = await Web3.utils.fromWei(element["value"], 'ether')
                    element["scanurl"] = network_details.scanurl + element["hash"]
                    element["trans_pool_id"] = trans_id
                    console.log("Error ===============", element)
                    let transcationLogs = await transcationLog.insertMany(element)
                    let network_update = await network.updateOne({ id: network_id }, { $set: { latest_block_number: element["blockNumber"] } })
                }
            });
        }
        response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
    }).catch(error => {
        console.log("error ==================", error)
        var stringify_response = stringify(error)
        response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
    })
    return response;
}
async function postRequest(URL, parameters, headers) {
    let response = {}
    console.log("parameters =================  postRequest", qs.stringify(parameters))
    await axios.post(URL,
        qs.stringify(parameters),
        { headers: headers })
        .then(res => {
            var stringify_response = stringify(res)
            console.log("res", res.data)
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        })
        .catch(error => {
            console.error("Error", error)
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
    return response;


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
            console.log("res.data.result=====================", res.data.result)
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
            // console.error("Error===============", error)
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
    async remaining_balance(previous, need, current) {
        console.log("remaining_balance==============", current - previous)
        console.log("remaining_balance==============", need)
        console.log("remaining_balance==============", need - (current - previous))
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
                console.log("res", res.data)
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
                console.log("res", res.data)
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
    async get_data_of_transcation() {

        if (Constant.index < Constant.translists.length) {
            let transData = Constant.translists[Constant.index]
            let transcationData = await getTranscationData(transData.transkey)
            let balance_data = await getBalance(transcationData, transData)
            let balanceResponse = JSON.parse(balance_data)
            if (balanceResponse.amountstatus == 1 || balanceResponse.amountstatus == 3) {
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

    async get_data_approvekyc() 
    {
        if (Constant.kycindex < Constant.kycapplication.length) 
        {
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
    async sendEmailFunction(paramters){
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
}
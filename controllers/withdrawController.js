const withdrawLogs      = require('../Models/withdrawLog');
const cornJobs          = require('../common/cornJobs');
const networks          = require('../Models/network');
var CryptoJS            = require('crypto-js')
var crypto              = require("crypto");
var Utility             = require('../common/Utility');
const bcrypt            = require('bcrypt');
const Web3              = require('web3');
const axios             = require('axios')
const clientWallets     = require('../Models/clientWallets');
const client            = require('../Models/clients');
const withdrawSettings  = require('../Models/withdrawSettings')
const currencies        = require('../Models/Currency')
const network           = require('../Models/network')
const kytlogs           = require('../Models/kytlogs')

var mongoose            = require('mongoose');
var qs                  = require('qs');
var FormData            = require('form-data');
require("dotenv").config()


async function postRequest(id, asset, address_to, cryptoamount, cryptousdamount, createdAt) {
    try {

        let kycurl = process.env.KYC_URL + process.env.KYT_URL_APPROVE.replace("id", id)
        let params =
        {
            "asset": asset,
            "address": address_to,
            "attemptIdentifier": id,
            "assetAmount": cryptoamount,
            "assetPrice": cryptousdamount,
            "assetDenomination": "USD",
            "attemptTimestamp": createdAt,
        }
        let response = await axios({
            method: 'post',
            url: kycurl,
            data: params,
            headers: {
                'Authorization': process.env.KYC_URL_TOKEN,

            }
        })
        return { status: 200, data: response, message: "Please" }

    }
    catch (error) {
        return { status: 400, data: error.body, message: error.message }
    }
}

async function priceConversition(currencyid, currency) {
    try 
    {
        let parameters      = `ids=${currencyid}&vs_currencies=${currency}`
        let COINGECKO_URL   =  process.env.COINGECKO+parameters
        let axiosGetData    =  await Utility.Get_Request_By_Axios(COINGECKO_URL,{},{})
        var stringify_response = JSON.parse(axiosGetData.data)
        return stringify_response.data 
    }
    catch (error) 
    {
        console.log(error)
       return {  }
    }
}

async function Network_Fee_Calculation(network) {
    try 
    {

        if(network.libarayType == "Web3")
        {
        const WEB3              = new Web3(new Web3.providers.HttpProvider(network.nodeUrl))
        const gasprice          = await WEB3.eth.getGasPrice()
        const gaspriceether     = await WEB3.utils.fromWei(gasprice,'ether')
        return { status: 200, data: {"gasprice":gasprice, "gaspriceether" : gaspriceether}, message: "GasPrice" }
        }
        else
        {  console.log("else",network.withdrawfee)
            return { status: 200, data: {"gasprice":network.withdrawfee, "gaspriceether" : network.withdrawfee}, message: "GasPrice" }
        }

    }
    catch (error) 
    {
       console.log("Network_Fee_Calculation",error)
       return { status: 400, data: {"gasprice":0, "gaspriceether" : 0}, message: "Error" }
    }
}

module.exports =
{
    
    async save_withdraw(req, res) {
        try {
           
            const network               = await networks.findOne({ id: req.body.network_id })
            const prevwithdrawLog       = await withdrawLogs.findOne({ api_key: req.headers.authorization, network_id: req.body.network_id, status: 0 })
            const clientWallet          = await clientWallets.findOne({ client_api_key: req.headers.authorization, network_id: req.body.network_id })
           
            if (prevwithdrawLog != null) 
            {
               return res.json({ status: 200, data: {}, message: "You have already a request in pending" })
            }

            if (req.body.amount <= network.transferlimit) 
            {
                return res.json({ status: 200, data: {}, message: "Invalid Amount" })
            }

            if (req.body.amount >= clientWallet.balance) 
            {
                return res.json({ status: 200, data: {}, message: "Invalid Amount" })
            }

            if (network == null) 
            {
                return res.json({ status: 400, data: {}, message: "Unsupported Network " })
            }
            let amount = req.body.amount
            let currentDateTemp          = Date.now();
            let transfer_fee = 0;
            let networkFee = null;
             
           if(network.withdrawflag == 1)
            {
                networkFee            = await Network_Fee_Calculation(network)
                transfer_fee          =  ((amount / network.transferlimit ) + network.processingfee) *  networkFee.data.gaspriceether 
            
            }
            else if(network.withdrawflag == 2)
            {
                // networkFee            = await Network_Fee_Calculation(network)
                transfer_fee          =  ((amount / network.transferlimit ) + network.processingfee) *  network.fixedfee
            
            }

            else if(network.withdrawflag == 3)
            {
                transfer_fee =  ((amount / network.transferlimit ) + network.processingfee) *  (amount * network.withdrawfee )
            }

            const withdrawLog = new withdrawLogs({
                    id               : crypto.randomBytes(20).toString('hex'),
                    api_key          : req.headers.authorization,
                    network_id       : req.body.network_id,
                    amount           : req.body.amount,
                    fee              : transfer_fee,
                    netamount        : (req.body.amount - transfer_fee),
                    address_to       : req.body.address_to,
                    address_from     : " ",
                    transcation_hash : " ",
                    timestamps       : new Date().getTime(),
                    status           : 0
                });
                withdrawLog.save().then(async (val) => 
                {
                    let kytdata             = await postRequest(val.id, network.kyt_network_id, val.address_to, val.amount, val.amount, val.createdAt)
                    let external_response   = kytdata.status == 200 ? kytdata.data.data.externalId : ""
                    let withdrawlog         = await withdrawLogs.findOneAndUpdate({ id: val.id }, { $set: { external_id: external_response, queue_type: 0 } })
                    let kycurl              = process.env.KYC_URL + process.env.KYT_URL_ALERTS.replace("id", external_response)
                    let response            = await axios({ method: 'get', url: kycurl, headers: { 'Authorization': process.env.KYC_URL_TOKEN ,}})
                    let status              = Object.keys(response.data.body).length > 0 ? 2 : 3
                    let withdrawdata        = await withdrawLogs.findOneAndUpdate({ id : withdrawlog.id }, { $set: { status : status , queue_type  :  status }},{ returnDocument: 'after' })
                    let kytlog              = await kytlogs.insertMany([{ id: mongoose.Types.ObjectId(), logs: JSON.stringify(kytdata.data.data), withdraw_id: val.id}])
              
                    if(status == 3 )
                    {
                    let prevbalance         = parseFloat(clientWallet.balance) -  parseFloat(req.body.amount)
                    let newclientWallet        = await clientWallets.findOneAndUpdate({ id : clientWallet.id }, { $set: { balance: prevbalance } } , {returnDocument : 'after'})
                    return res.json({ status: 200, message: "Saved Successfully", data: val })
                    }
                    if(status == 2 )
                    {
                        await client.findOneAndUpdate({ api_key : clientWallet.client_api_key }, { $set: { authtoken : "",disablestatus:true,disable_remarks:"Due to KYT did not approved", disable_date : new Date().toString()} } , {returnDocument : 'after'})
                        return res.json({ status: 400, message: "Your Account Has Disabled. Kindly Contact Customer Support", data: {} })
                    }
                    
                }).catch( error => 
                {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: "Invalid" })
                })
          }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async update_withdraw_request(req, res) {
        try {
            await withdrawLogs.findOneAndUpdate(
                { id: req.body.id, status: 3 },
                {
                    $set:
                    {
                        remarks: req.body.remarks,
                        status: req.body.status,
                        address_from: req.body.address_from,
                        transcation_hash: req.body.transcation_hash
                    }
                }, { returnDocument: 'after' }).then(async (withdraw) => {
                    if (withdraw == null) 
                    {
                        return res.json({ status: 400, message: "KYT has not finished", data: {} })
                    }
                    else if (req.body.status == 4) 
                    {

                        res.json({ status: 200, message: "Successfully", data: withdraw })
                    }
                    else if (req.body.status == 5) 
                    {
                        let val          = await clientWallets.findOne({ client_api_key: withdraw.api_key, network_id: withdraw.network_id })
                        let clientWallet = await clientWallets.updateOne({ client_api_key: withdraw.api_key, network_id: withdraw.network_id }, { $set: { balance: (val.balance + withdraw.amount) } })
                        res.json({ status: 200, message: "Successfully", data: withdraw })
                    }

                   
                   

                }).catch(
                    error => {
                        res.json({ status: 400, data: {}, message: "Invalid" })
                    })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_client_wihdraw(req, res) {
        try {
            await withdrawLogs.aggregate(
                [
                    { $match: { api_key: req.headers.authorization } },
                    {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project": {
                            "api_key" : 0,
                            "networkDetails.libarayType": 0,
                            "networkDetails.contractAddress": 0,
                            "networkDetails.contractABI": 0,
                            "networkDetails.apiKey": 0,
                     
                            
                            "networkDetails.status": 0,
                            "networkDetails.gaspriceurl": 0,
                            "networkDetails.latest_block_number": 0,
                            "networkDetails.processingfee": 0,
                            "networkDetails.transferlimit": 0,
                            "networkDetails.deleted_by": 0,
                            "networkDetails.kyt_network_id": 0,
                            "networkDetails.withdrawfee": 0,
                            "networkDetails.withdrawflag": 0,
                            "networkDetails.native_currency_id": 0,
                            "networkDetails.fixedfee": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_client_wihdraw_total(req, res) {
        try {
            await withdrawLogs.aggregate(
                [
                    { $group: { _id: '$network_id', total: { $sum: '$amount' } } },
                    { $lookup: { from: "networks", localField: "_id", foreignField: "id", as: "networkDetails" } },
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_admin_wihdraw(req, res) {
        try {
            if (req.body.status != "" && req.body.status != undefined) {
                await withdrawLogs.aggregate(
                    [
                        { $match: { status: parseInt(req.body.status) } },
                        {
                            $skip: parseInt(req.body.offest)
                        },
                        {
                            $limit: parseInt(req.body.limit)
                        },

                        {
                            $lookup:
                            {
                                from: "clients", // collection to join
                                localField: "api_key",//field from the input documents
                                foreignField: "api_key",//field from the documents of the "from" collection
                                as: "clientsDetails"// output array field
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "networks", // collection to join
                                localField: "network_id",//field from the input documents
                                foreignField: "id",//field from the documents of the "from" collection
                                as: "networkDetails"// output array field
                            }
                        },
                        {
                            "$project": {
                                "networkDetails.__v": 0,
                                "networkDetails.id": 0,
                                "networkDetails.nodeUrl": 0,
                                "networkDetails.created_by": 0,
                                "networkDetails.createdAt": 0,
                                "networkDetails.updatedAt": 0,
                                "networkDetails._id": 0,
                                "clientsDetails._id": 0,
                                "clientsDetails.authtoken": 0,
                                "clientsDetails.token": 0,
                                "clientsDetails.two_fa": 0,
                                "clientsDetails.password": 0,
                                "clientsDetails.qrcode": 0,
                                "clientsDetails.secret": 0,
                                "clientsDetails.emailstatus": 0,
                                "clientsDetails.loginstatus": 0,
                                "clientsDetails.emailtoken": 0,
                                "clientsDetails.kycLink": 0,
                                

                            }
                        }
                    ]).then(async (data) => {
                        res.json({ status: 200, message: "Withdraw Pool", data: data })
                    }).catch(error => {
                        console.log("get_clients_data", error)
                        res.json({ status: 400, data: {}, message: error })
                    })
            }
            else {
                await withdrawLogs.aggregate(
                    [
                        {
                            $skip: parseInt(req.body.offest)
                        },
                        {
                            $limit: parseInt(req.body.limit)
                        },
                        {
                            $lookup:
                            {
                                from: "clients", // collection to join
                                localField: "api_key",//field from the input documents
                                foreignField: "api_key",//field from the documents of the "from" collection
                                as: "clientsDetails"// output array field
                            }
                        },
                        {
                            $lookup: {
                                from: "networks", // collection to join
                                localField: "network_id",//field from the input documents
                                foreignField: "id",//field from the documents of the "from" collection
                                as: "networkDetails"// output array field
                            }
                        },
                        {
                            "$project": {
                                "networkDetails.__v": 0,
                                "networkDetails.id": 0,
                                "networkDetails.nodeUrl": 0,
                                "networkDetails.created_by": 0,
                                "networkDetails.createdAt": 0,
                                "networkDetails.updatedAt": 0,
                                "networkDetails._id": 0
                            }
                        }
                    ]).then(async (data) => {
                        res.json({ status: 200, message: "Withdraw Pool", data: data })
                    }).catch(error => {
                        console.log("get_clients_data", error)
                        res.json({ status: 400, data: {}, message: error })
                    })
            }
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_admin_wihdraw_with_Network_ID(req, res) {
        try {
            await withdrawLogs.aggregate(
                [
                    { $match: { "network_id": req.body.networkid } },
                    {
                        $lookup:
                        {
                            from: "clients", // collection to join
                            localField: "api_key",//field from the input documents
                            foreignField: "api_key",//field from the documents of the "from" collection
                            as: "clientsDetails"// output array field
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },

                    {
                        "$project": {
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_client_withdraw_with_network_id(req, res) {
        try {
            await withdrawLogs.aggregate(
                [
                    { $match: { api_key: req.headers.authorization, network_id: req.body.networkid } },
                    {
                        $lookup:
                        {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project": {
                            "api_key" : 0,
                            "networkDetails.__v": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async merchantBalance(req, res) {
        try {

            let ethPrice = 0;
            let withdrawable = 0;
            let fee = 0;
            let networkid = ''
            let settings = ''
            let balance = await clientWallets.findOne({ "id": req.body.clientWalletid })
            if(balance == null){
                return res.json({ status: 400, data: { }, message: "Invalid Balance" })
            }
            networkid = balance.network_id
            settings = await withdrawSettings.find();
            if (settings[0].merchantWithdrawLimit >= balance.balance) {
                res.json({ status: 200, data: { "balance": balance.balance, "minimumrequiredtowithdraw": settings[0].merchantWithdrawLimit }, message: "clientBalance" })
            }
            else if (settings[0].merchantWithdrawMode == "percentage") {
                fee = ((settings[0].merchantWithdrawFeePercentage) / 100) * balance.balance
                withdrawable = balance.balance - fee
                res.json({ status: 200, data: { "balance": balance.balance, "fee": fee, "withdrawable": withdrawable }, message: "clientBalance" })
            }
            else if (settings[0].merchantWithdrawMode == "limit") {
                try {
                    let netwokDetails = await network.findOne({ "id": networkid })
                    if (netwokDetails.libarayType == 'Web3') {
                        response = {}
                        let URL = netwokDetails.gaspriceurl + "?module=gastracker&action=gasoracle&apikey=" + netwokDetails.apiKey
                        console.log("URL", URL)
                        let resaxios = await axios.get(URL);
                        let gasPrice = resaxios.data.result.FastGasPrice
                        let gwei = 21000 * gasPrice
                        console.log(gwei)
                        ethPrice = gwei * 0.000000001
                    }
                    else {
                    }
                }
                catch (error) {
                    console.log(error)
                    res.json({ status: 400, data: error, message: "Error" })
                }
                console.log(balance.balance / settings[0].pooltohotLimit, ethPrice)
                fee = ((balance.balance / settings[0].pooltohotLimit) + 1) * ethPrice
                console.log("fee", fee)
                withdrawable = balance.balance - fee
                res.json({ status: 200, data: { "balance": balance.balance, "fee": fee, "withdrawable": withdrawable }, message: "clientBalance" })
            }
        }
        catch (error) { console.log(error) }
    },
    async withdrawBalance(req, res) {
        let ethPrice         = 0;
        let withdrawable     = 0;
        let fee              = 0;
        let networkid        = ''
        let settings         = ''
        let data             = 100
        let amount           = parseFloat(req.body.amount)
        let current_currency = "usd"
        
        try {
            const balance       = await clientWallets.findOne({ "id": req.body.clientWalletid , "client_api_key":req.headers.authorization })
           
            if( req.body.currencyid  != undefined && req.body.currencyid  != ""  )
            {
                const currency   = await currencies.findOne({ "id": req.body.currencyid, status:1 })

            if (currency == null ) 
            {
               return res.json({ status: 400, data: null, message: "Invalid Currency ID" })
            }
            else
            {
                current_currency = currency != null ?  currency.title.toLowerCase() : current_currency
            }

            }


            if (balance == null ) 
            {
               return res.json({ status: 400, data: null, message: "Wallet did not find" })
            }
            const network   = await networks.findOne({ id: balance.network_id })
            if (amount < network.transferlimit ) 
            {  
                return   res.json({
                 status: 200, 
                 data: 
                {
                    "withdraw_amount"   : req.body.amount ,
                    "transcationfee"    : 0 , 
                    "limit"              : network.transferlimit, 
                    "netamount"         : req.body.amount 
                }, 
                 message: "Amount shoud be greater than or equal to minimum Withdrawal limit" }
                 )
            }
            
            let transfer_fee = 0;
            let networkFee = null;
             
           if(network.withdrawflag == 1)
            {
                networkFee            = await Network_Fee_Calculation(network)
                transfer_fee          =  ((amount / network.transferlimit ) + network.processingfee) *  networkFee.data.gaspriceether 
            
            }
            else if(network.withdrawflag == 2)
            {
                // networkFee            = await Network_Fee_Calculation(network)
                transfer_fee          =  ((amount / network.transferlimit ) + network.processingfee) *  network.fixedfee
            
            }

            else if(network.withdrawflag == 3)
            {
                transfer_fee =  ((amount / network.transferlimit ) + network.processingfee) *  (amount * network.withdrawfee )
            }
           

            let native_currency      = {}
            let pricenative_currency = {}
            let price                = 0
            let netamount            = 0
            let tokenprice           = 0
            let token_currency       = {}
            let pricetoken_currency  = {}
        
            if(network.cointype == "Native")
            {
                native_currency       = await priceConversition(network.native_currency_id, current_currency)
                pricenative_currency  = native_currency[network.native_currency_id]
                price                 = pricenative_currency[current_currency]  * transfer_fee
                pricetoken_currency   = native_currency[network.native_currency_id]
                netamount             = amount - price
                tokenprice            = price
            }
            else
            {
             native_currency       = await priceConversition(network.native_currency_id, current_currency)
             pricenative_currency  = native_currency[network.native_currency_id]
             price                 = pricenative_currency[current_currency]  * transfer_fee
             token_currency        = await priceConversition(network.currencyid, current_currency)
             pricetoken_currency   = token_currency[network.currencyid]
             tokenprice            = (pricetoken_currency[current_currency]  * price)
             netamount             = amount - tokenprice
            }
           
            return res.json
               ({
                 status     : 200, 
                 data       : 
                 {    
                    "limit"             : network.transferlimit,
                    "currency"          : current_currency, 
                    "withdraw_amount"   : parseFloat(req.body.amount),
                    "native_price"      : pricenative_currency[current_currency],
                    "token_price"       : pricetoken_currency[current_currency],
                    "fee_in_native"     : transfer_fee ,
                    "Network"           : network.network, 
                    "coin"              : network.coin , 
                    "fee_in_token"      : tokenprice , 
                    "netamount"         : netamount 
                 }, 
                 message                : "Fee Details" 
               })


            // if (balance.balance >= amount) {
            //     if (amount >= data) {
            //         networkid = balance.network_id
            //         settings = await withdrawSettings.find();
            //         if (settings[0].merchantWithdrawLimit >= amount) {
            //             res.json({ status: 200, data: { "balance": balance.balance, "minimum required to withdraw": settings[0].merchantWithdrawLimit }, message: "clientBalance" })
            //         }
            //         else if (settings[0].merchantWithdrawMode == "percentage") {
            //             fee = ((settings[0].merchantWithdrawFeePercentage) / 100) * amount
            //             withdrawable = amount - fee
            //             res.json({ status: 200, data: { "balance": balance.balance, "fee": fee, "withdrawable": withdrawable }, message: "clientBalance" })
            //         }
            //         else if (settings[0].merchantWithdrawMode == "limit") {
            //             try {
            //                 let netwokDetails = await network.findOne({ "id": networkid })
            //                 if (netwokDetails.libarayType == 'Web3') {
            //                     response = {}
            //                     let URL = netwokDetails.gaspriceurl + "?module=gastracker&action=gasoracle&apikey=" + netwokDetails.apiKey
            //                     console.log("URL", URL)
            //                     let resaxios = await axios.get(URL);
            //                     let gasPrice = resaxios.data.result.FastGasPrice
            //                     let gwei = 21000 * gasPrice
            //                     console.log(gwei)
            //                     ethPrice = gwei * 0.000000001
            //                 }
            //                 else {
            //                 }
            //             }
            //             catch (error) {
            //                 console.log(error)
            //                 res.json({ status: 400, data: error, message: "Error" })
            //             }
            //             console.log(balance.balance / settings[0].pooltohotLimit, ethPrice)
            //             fee = ((amount / settings[0].pooltohotLimit) + 1) * ethPrice
            //             console.log("fee", fee)
            //             withdrawable = amount - fee
            //             res.json({ status: 200, data: { "balance": balance.balance, "fee": fee, "withdrawable": withdrawable }, message: "clientBalance" })
            //         }


            //     }
            //     else res.json({ status: 400, data: balance.balance, message: "Amount shoud be greater than minimum Withdrawal limit" })
            // }
            // else res.json({ status: 200, data: balance.balance, message: "Amount shoud be less than or equal to balance" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: 'null', mewssage: "Some error happened" })
        }
    },
    async getWithdrawSettings(req, res) {
        try {
            let data = await withdrawSettings.find();
            console.log("withdraw settings", data)
            res.json({ status: 200, data: data, message: "getWithdrawSettings" })
        }
        catch (error) {
            res.json({ status: 400, data: error, message: "Not found" })
        }
    },
    async setWithdrawSettings(req, res) {
        let settings = req.body
        let data = ''
        let message = ''
        let status = 200
        try {
            let data = await withdrawSettings.findOneAndUpdate({}, {
                $set: {
                    id: mongoose.Types.ObjectId(),
                    pooltohotMode: settings.pooltohotMode,
                    pooltohotLimit: settings.pooltohotLimit,
                    merchantWithdrawMode: settings.merchantWithdrawMode,
                    merchantWithdrawLimit: settings.merchantWithdrawLimit,
                    merchantWithdrawFeePercentage: settings.merchantWithdrawFeePercentage
                }
            })


            message = "Withdraw Settings saved"
            status = 200
        }
        catch (error) {
            console.log("new invoice error", error)
            message = error
            status = 400
        }
        res.json({ status: status, data: data, message: message })
    },
    async setMerchantWitthdrawMode(req, res) {
        try {
            let data = await withdrawSettings.findOneAndUpdate({}, { $set: { "merchantWithdrawMode": req.body.mode } });
            console.log("withdraw settings", data)
            res.json({ status: 200, data: req.body.mode, message: "setMerchantWitthdrawMode" })
        }
        catch (error) {
            res.json({ status: 400, data: error, message: "Error" })
        }
    },
    async setMerchantWitthdrawLimit(req, res) {
        try {
            let data = await withdrawSettings.findOneAndUpdate({}, { $set: { "merchantWithdrawLimit": req.body.limit } });
            console.log("withdraw settings", data)
            res.json({ status: 200, data: req.body.limit, message: "merchantWithdrawLimit" })
        }
        catch (error) {
            res.json({ status: 400, data: error, message: "Error" })
        }
    },
    async setMerchantWitthdrawFeePercentage(req, res) {
        try {
            let data = await withdrawSettings.findOneAndUpdate({}, { $set: { "merchantWithdrawFeePercentage": req.body.fee } });
            console.log("withdraw settings", data)
            res.json({ status: 200, data: req.body.fee, message: "merchantWithdrawFeePercentage" })
        }
        catch (error) {
            res.json({ status: 400, data: error, message: "Error" })
        }
    },
    async setPooltoHotMode(req, res) {
        try {
            let data = await withdrawSettings.findOneAndUpdate({}, { $set: { "pooltohotMode": req.body.mode } });
            console.log("withdraw settings", data)
            res.json({ status: 200, data: req.body.mode, message: "pooltohotMode" })
        }
        catch (error) {
            res.json({ status: 400, data: error, message: "Error" })
        }
    },
    async setPooltoHotLimit(req, res) {
        try {
            let data = await withdrawSettings.findOneAndUpdate({}, { $set: { "pooltohotLimit": req.body.limit } });
            console.log("withdraw settings", data)
            res.json({ status: 200, data: req.body.limit, message: "pooltohotLimit" })
        }
        catch (error) {
            res.json({ status: 400, data: error, message: "Error" })
        }
    },
    async getGasFee(req, res) {
        console.log("netwok", req.body.id)
        let nwfee = 0;
        try {

            let netwokDetails = await network.findOne({ "id": req.body.id })
            if (netwokDetails.libarayType == 'Web3') {
                console.log("netwokDetails", netwokDetails.gaspriceurl)
                response = {}
                let URL = netwokDetails.gaspriceurl + "?module=gastracker&action=gasoracle&apikey=" + netwokDetails.apiKey
                console.log("URL", URL)
                let resaxios = await axios.get(URL);
                let gasPrice = resaxios.data.result.FastGasPrice  //21000

                let gwei = 21000 * gasPrice
                console.log(gwei)
                let ethPrice = gwei * 0.000000001
                console.log("ethprice", ethPrice)
                res.json({ status: 200, data: ethPrice, message: "price" })
            }
            else {
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: error, message: "Error" })
        }
    },



}





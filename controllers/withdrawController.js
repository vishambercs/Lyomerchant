const withdrawLogs = require('../Models/withdrawLog');
const cornJobs = require('../common/cornJobs');
const networks = require('../Models/network');
var CryptoJS = require('crypto-js')
var crypto = require("crypto");
var Utility = require('../common/Utility');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const axios = require('axios')
const clientWallets = require('../Models/clientWallets');
const withdrawSettings = require('../Models/withdrawSettings')
const network = require('../Models/network')
const kytlogs = require('../Models/kytlogs')
var mongoose = require('mongoose');
var qs = require('qs');
var FormData = require('form-data');
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


module.exports =
{
    async save_withdraw(req, res) {
        try {
            const network = await networks.findOne({ id: req.body.network_id })
            const withdrawLog = await withdrawLogs.findOne({ api_key: req.headers.authorization, network_id: req.body.network_id, status: 0 })
            const clientWallet = await clientWallets.findOne({ client_api_key: req.headers.authorization, network_id: req.body.network_id })
            if (withdrawLog != null) {
                res.json({ status: 200, data: {}, message: "You have already a request in pending" })
            }
            else if (req.body.amount > clientWallet.balance) {
                res.json({ status: 200, data: {}, message: "Invalid Amount" })
            }
            else if (network != null) {
                let transfer_fee = ((parseFloat(req.body.amount) / 10000) + network.processingfee) * 0.03
                const withdrawLog = new withdrawLogs({
                    id: crypto.randomBytes(20).toString('hex'),
                    api_key: req.headers.authorization,
                    network_id: req.body.network_id,
                    amount: req.body.amount,
                    fee: transfer_fee,
                    address_to: req.body.address_to,
                    address_from: " ",
                    transcation_hash: " ",
                    status: 0
                });
                withdrawLog.save().then(async (val) => {
                    let kytdata = await postRequest(val.id, network.kyt_network_id, val.address_to, val.amount, val.amount, val.createdAt)
                    let external_response = kytdata.status == 200 ? kytdata.data.data.externalId : ""
                    let withdrawlog = await withdrawLogs.findOneAndUpdate({ id: val.id }, { $set: { external_id: external_response, queue_type: 0 } })
                    let kytlog = await kytlogs.insertMany([{
                        id: mongoose.Types.ObjectId(),
                        logs: JSON.stringify(kytdata.data.data),
                        withdraw_id: val.id
                    }])
                    res.json({ status: 200, message: "Successfully", data: val })
                }).catch(
                    error => {
                        res.json({ status: 400, data: {}, message: error })
                    })
            }
            else {
                res.json({ status: 400, data: {}, message: "Unsupported Network " })
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async update_withdraw_request(req, res) {
        try {
            await withdrawLogs.findOneAndUpdate(
                { id: req.body.id, status: 1 },
                {
                    $set:
                    {
                        remarks: req.body.remarks,
                        status: req.body.status,
                        address_from: req.body.address_from,
                        transcation_hash: req.body.transcation_hash
                    }
                }, { $new: true }).then(async (withdraw) => {
                    if (withdraw == null) {
                        return res.json({ status: 400, message: "KYT has not finished", data: {} })
                    }
                    else if (req.body.status == 1) {
                        let val = await clientWallets.findOne({ api_key: withdraw.api_key, network_id: withdraw.network_id })
                        let clientWallet = await clientWallets.updateOne({ api_key: withdraw.api_key, network_id: withdraw.network_id }, { $set: { balance: (val.balance - withdraw.amount) } })
                    }
                    let withdrawLog = await withdrawLogs.findOne({ id: req.body.id })
                    res.json({ status: 200, message: "Successfully", data: withdrawLog })

                }).catch(
                    error => {
                        res.json({ status: 400, data: {}, message: error })
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
        let ethPrice = 0;
        let withdrawable = 0;
        let fee = 0;
        let networkid = ''
        let settings = ''
        let data = 100
        let amount = req.body.amount
        try {
            let balance = await clientWallets.findOne({ "id": req.body.clientWalletid })
            if (balance.balance >= amount) {
                if (amount >= data) {
                    networkid = balance.network_id
                    settings = await withdrawSettings.find();
                    if (settings[0].merchantWithdrawLimit >= amount) {
                        res.json({ status: 200, data: { "balance": balance.balance, "minimum required to withdraw": settings[0].merchantWithdrawLimit }, message: "clientBalance" })
                    }
                    else if (settings[0].merchantWithdrawMode == "percentage") {
                        fee = ((settings[0].merchantWithdrawFeePercentage) / 100) * amount
                        withdrawable = amount - fee
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
                        fee = ((amount / settings[0].pooltohotLimit) + 1) * ethPrice
                        console.log("fee", fee)
                        withdrawable = amount - fee
                        res.json({ status: 200, data: { "balance": balance.balance, "fee": fee, "withdrawable": withdrawable }, message: "clientBalance" })
                    }


                }
                else res.json({ status: 400, data: balance.balance, message: "Amount shoud be greater than minimum Withdrawal limit" })
            }
            else res.json({ status: 200, data: balance.balance, message: "Amount shoud be less than or equal to balance" })
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
    // async setWithdrawSettings1(req, res) {
    //     let settings = req.body
    //     let data = ''
    //     let message = ''
    //     let status = 200
    //     try {
    //         let new_record = new withdrawSettings({
    //             id: mongoose.Types.ObjectId(),
    //             pooltohotMode: settings.pooltohotMode,
    //             pooltohotLimit: settings.pooltohotLimit,
    //             merchantWithdrawMode: settings.merchantWithdrawMode,
    //             merchantWithdrawLimit: settings.merchantWithdrawLimit,
    //             merchantWithdrawFeePercentage: settings.merchantWithdrawFeePercentage
    //         })
    //         console.log(new_record)
    //         data = await new_record.save()
    //         message = "Withdraw Settings saved"
    //         status = 200
    //     }
    //     catch (error) {
    //         console.log("new invoice error", error)
    //         message = error
    //         status = 400
    //     }
    //     res.json({ status: status, data: data, message: message })
    // },
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





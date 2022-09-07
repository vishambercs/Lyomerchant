const hotWalletTransLogs = require('../Models/hot_wallet_trans_logs');
const network = require('../Models/network');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
const poolWallets = require('../Models/poolWallet');
const feedWallets = require('../Models/feedWallets');
const Constant = require('../common/Constant');
const { get_Balance } = require('./clientsController');
//const commonFunction = require("../common/commonFunction")
const transferUtility = require('../common/transferUtility');

require("dotenv").config()

module.exports =
{

    async getTranscationData(req, res) {
        try {

            let pooldata = await hotWalletTransLogs.aggregate(
                [
                    { $match: { id: req.body.id } },
                    {
                        $lookup: {
                            from: "transactionpools", // collection to join
                            localField: "merchant_trans_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "transactionPoolsDetails"// output array field
                        },
                    }, {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
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
            let networkDetails = pooldata[0].networkDetails[0]
            let addressObject = pooldata[0]
            let gas_price = 0
            let gas_used = 0
            let account_balance_in_ether = 0
            if (networkDetails.libarayType == "Web3") {
                const WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject.networkDetails[0].nodeUrl))
                if (addressObject.networkDetails[0].cointype == "Token") {
                    const contract = new WEB3.eth.Contract(Constant.USDT_ABI, addressObject.networkDetails[0].contractAddress,);
                    // const transData =  await WEB3.eth.getTransaction(addressObject.trans_id)
                    gas_price = await WEB3.eth.getTransaction(addressObject.trans_id)
                    gas_used = await WEB3.eth.getTransactionReceipt(addressObject.trans_id)
                    transaction_cost = gas_price.gasPrice * gas_used.gasUsed
                    console.log("getTranscationData ===================== ", transaction_cost)
                    console.log("getTranscationData ===================== ", gas_price)
                    console.log("getTranscationData ===================== ", gas_used)
                }
                else if (addressObject.networkDetails[0].cointype == "Native") {
                    const transData = await WEB3.eth.getTransaction(addressObject.trans_id)
                    console.log("getTranscationData===================== ", transData)
                }
                account_balance_in_ether = WEB3.utils.fromWei(transaction_cost.toString(), 'ether')
            }

            res.json({ status: 200, message: "Successfully", data: transaction_cost, "account_balance_in_ether": account_balance_in_ether })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

    async get_All_Hot_Wallet_Transcation(req, res) {
        try {
            let pooldata = await hotWalletTransLogs.aggregate(
                [
                    {
                        $lookup: {
                            from: "transactionpools", // collection to join
                            localField: "merchant_trans_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "transactionPoolsDetails"// output array field
                        },
                    },
                    {
                        $lookup: {
                            from: "postransactionpools", // collection to join
                            localField: "merchant_trans_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "postransactionpoolsDetails"// output array field
                        },
                    },
                    {
                        $lookup: {
                            from: "feedwallets", // collection to join
                            localField: "feeding_wallet_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "feedwalletsDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "pool_wallet_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolwalletsDetails"// output array field
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
            res.json({ status: 200, message: "Successfully", data: pooldata })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },
    async Get_Feeding_Transfer_Status(req, res) {
        try {

            const feedingWallet = await feedWallets.aggregate([
                { $match: { "id": req.body.feedingid, } },
                { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } },
            ])
            if (feedingWallet == null) {
                return res.json({ status: 400, data: {}, message: "Invalid Feeding Wallet ID" })
            }

            let response = await transferUtility.check_Status_Feeding_Transcation(
                feedingWallet[0].networkDetails[0].nodeUrl,
                feedingWallet[0].networkDetails[0].libarayType,
                feedingWallet[0].privatekey,
                req.body.transid,
            )

            res.json(response)

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },
    async trans_from_pw_to_hw(req, res) {
        try {
            let pooldata = await hotWalletTransLogs.aggregate(
                [
                    { $match: { id: req.body.id } },
                    {
                        $lookup: {
                            from: "transactionpools", // collection to join
                            localField: "merchant_trans_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "transactionPoolsDetails"// output array field
                        },
                    },
                    {
                        $lookup: {
                            from: "postransactionpools", // collection to join
                            localField: "merchant_trans_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "postransactionpoolsDetails"// output array field
                        },
                    },
                    {
                        $lookup: {
                            from: "feedwallets", // collection to join
                            localField: "feeding_wallet_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "feedwalletsDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "pool_wallet_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolwalletsDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "feedwalletsDetails.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        $lookup: {
                            from: "hotwallets", // collection to join
                            localField: "hot_wallet_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "hotwalletsDetails"// output array field
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
            if (pooldata == null) 
            {
                   return res.json({ status: 400, data: {}, message: "Invalid ID" })
            }
            let balance = await transferUtility.CheckBalanceOfAddress(
                pooldata[0].networkDetails[0].nodeUrl,
                pooldata[0].networkDetails[0].libarayType,
                pooldata[0].poolwalletsDetails[0].address,
                pooldata[0].networkDetails[0].contractAddress,
                pooldata[0].poolwalletsDetails[0].privateKey,
                )
                let remarks = pooldata[0].remarks;
                remarks = JSON.parse(remarks);
                var dateTime    = new Date();
                remarks.push(
                    {
                    "message": "Transfered From Pool Wallets to Hot Wallets",
                    "timestamp": dateTime.toString(),
                    "method": "trans_from_pw_to_hw"
                })
                res.json({"balance":balance ,"remarks":remarks })
                // hotWalletTransLogs.findByIdAndUpdate({ id: req.body.id},{$set : {}})
             if (pooldata[0].networkDetails[0].libarayType == "Tronweb") 
            {
                let transfertoken = await transferUtility.transfertokenTronWeb(
                    pooldata[0].networkDetails[0].nodeUrl, 
                    pooldata[0].networkDetails[0].contractAddress, 
                    pooldata[0].poolwalletsDetails[0].address,  
                    pooldata[0].poolwalletsDetails[0].privateKey,   
                    pooldata[0].hotwalletsDetails[0].address, 
                    parseFloat(balance.data.format_token_balance), 
                    )
                   
                    hotWalletTransLogs.findByIdAndUpdate({ id: req.body.id},{$set:
                        {
                            'status':0,
                            deleted_by: req.body.deleted_by,
                            remarks: remarks,
        
                        }})


                    // res.json({"balance":balance ,"transfertoken":transfertoken })
            }
            else{
                res.json(balance)
            }

            // let response = await transferUtility.check_Status_Feeding_Transcation(
            //     feedingWallet[0].networkDetails[0].nodeUrl,
            //     feedingWallet[0].networkDetails[0].libarayType,
            //     feedingWallet[0].privatekey,
            //     req.body.transid,
            //     )

            

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },




}
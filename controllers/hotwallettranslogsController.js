const hotWalletTransLogs = require('../Models/hot_wallet_trans_logs');
const network = require('../Models/network');
const HotTransLogs = require('../Models/HotTransLogs');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
const poolWallets = require('../Models/poolWallet');
const feedWallets = require('../Models/feedWallets');
const Constant = require('../common/Constant');
const { get_Balance } = require('./clientsController');
const feedWalletController = require('./Masters/feedWalletController');
const transferUtility = require('../common/transferUtility');
require("dotenv").config()

async function get_All_Hot_Wallet_Transcation(id) {
    try {
        if (id == 0) {
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
                            from: "paymentlinktransactionpools",    // collection to join
                            localField: "merchant_trans_id",        //field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "paymentlinkDetails"// output array field
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
            return pooldata
        }
        else {
            let pooldata = await hotWalletTransLogs.aggregate(
                [
                    { $match: { id: id } },
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
                            from: "paymentlinktransactionpools",    // collection to join
                            localField: "merchant_trans_id",        //field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "paymentlinkDetails"// output array field
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
            return pooldata
        }

    }
    catch (error) {
        console.log("===========error===========", error)
        return []
    }
}

module.exports =
{
    get_HW_Translogs_byID : get_All_Hot_Wallet_Transcation,
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
            let pooldata = await get_All_Hot_Wallet_Transcation(0)

            res.json({ status: 200, message: "Successfully", data: pooldata })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },
    async Get_Feeding_Transfer_Status(req, res) {
        try {

            // const feedingWallet = await feedWallets.aggregate([
            //     { $match: { "id": req.body.feedingid, } },
            //     { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } },
            // ])
            const feedingWallet = await get_All_Hot_Wallet_Transcation(req.body.feedingid) 
            if (feedingWallet == null) {
                return res.json({ status: 400, data: {}, message: "Invalid Feeding Wallet ID" })
            }
            console.log("feedingWallet",feedingWallet)   
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
            let pooldata = await get_All_Hot_Wallet_Transcation(req.body.id)
            if (pooldata == null) {
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
            if (pooldata[0].networkDetails[0].libarayType == "Tronweb") {
                let transfertoken = await transferUtility.transfertokenTronWeb
                    (
                        pooldata[0].networkDetails[0].nodeUrl,
                        pooldata[0].networkDetails[0].contractAddress,
                        pooldata[0].poolwalletsDetails[0].address,
                        pooldata[0].poolwalletsDetails[0].privateKey,
                        pooldata[0].hotwalletsDetails[0].address,
                        balance.data.token_balance,
                    )
                if (transfertoken.status == 400 || transfertoken.status == 401) {
                    return res.json({
                        status: transfertoken.status, data:
                        {
                            "Type": "Pool Wallet to Hot Wallet",
                            "from": pooldata[0].poolwalletsDetails[0].address,
                            "to": pooldata[0].hotwalletsDetails[0].address,
                            "coin": pooldata[0].networkDetails[0].network,
                        },
                        message: NativeTransfer.message
                    })
                }


                let Message = transfertoken.status == 200 ? "Transfered To Hot Wallets" : "There is an error in transfering the to hotwallets."
                let remarksData = await transferUtility.push_The_Remarks(remarks, Message, "trans_from_pw_to_hw")
                let hotWalletTransLog = await hotWalletTransLogs.findOneAndUpdate({ id: req.body.id },
                    {
                        $set:
                        {
                            status: transfertoken.status == 200 ? 1 : 2,
                            trans_id: transfertoken.status == 200 ? transfertoken.data : "",
                            remarks: remarksData.data,
                        }
                    },
                    { $new: true }
                )
                const HotTransLog = new HotTransLogs({
                    id: mongoose.Types.ObjectId(),
                    feeding_trans_id: req.body.id,
                    trans_id: transfertoken.status == 200 ? transfertoken.data : " ",
                    created_by: req.headers.authorization,
                    created_at: new Date().toString(),
                    type: "Pool Wallet to hot wallet"
                });
                let logs = await HotTransLog.save()
                let updatedpooldata = await get_All_Hot_Wallet_Transcation(req.body.id)

                res.json({ status: 200, data: updatedpooldata, message: "Successfully Done" })

            }
            else {
                let gasfee = await transferUtility.calculateGasFee(pooldata[0].networkDetails[0].nodeUrl, pooldata[0].networkDetails[0].libarayType, pooldata[0].poolwalletsDetails[0].address, pooldata[0].hotwalletsDetails[0].address, balance.data.token_balance, pooldata[0].networkDetails[0].contractAddress)
                if (gasfee.status == 400) {
                    return res.json({ status: 400, data: gasfee, message: "There is an error in calculating gas fee" })
                }

                let transfertoken = await transferUtility.transfertokenWeb3(
                    pooldata[0].networkDetails[0].nodeUrl,
                    pooldata[0].networkDetails[0].contractAddress,
                    pooldata[0].poolwalletsDetails[0].address,
                    pooldata[0].poolwalletsDetails[0].privateKey,
                    pooldata[0].hotwalletsDetails[0].address,
                    balance.data.token_balance,
                    gasfee.data.fee,
                )

                if (transfertoken.status == 400 || transfertoken.status == 401) {
                    return res.json({
                        status: transfertoken.status, data:
                        {
                            "Type": "Pool Wallet to Hot Wallet",
                            "from": pooldata[0].poolwalletsDetails[0].address,
                            "to": pooldata[0].hotwalletsDetails[0].address,
                            "coin": pooldata[0].networkDetails[0].network,
                        }, message: transfertoken.message
                    })
                }

                let Message = transfertoken.status == 200 ? JSON.stringify(transfertoken.output) : "There is an error in transfering the to hotwallets."
                let remarksData = await transferUtility.push_The_Remarks(remarks, Message, "trans_from_pw_to_hw")
                let hotWalletTransLog = await hotWalletTransLogs.findOneAndUpdate({ id: req.body.id },
                    {
                        $set:
                        {
                            status: transfertoken.status == 200 ? 1 : 2,
                            trans_id: transfertoken.status == 200 ? transfertoken.data : "",
                            remarks: remarksData.data,
                        }
                    },
                    { $new: true }
                )
                const HotTransLog = new HotTransLogs({
                    id: mongoose.Types.ObjectId(),
                    feeding_trans_id: req.body.id,
                    trans_id: transfertoken.status == 200 ? transfertoken.data : " ",
                    created_by: req.headers.authorization,
                    created_at: new Date().toString(),
                    type: "Pool Wallet to hot wallet"
                });
                let logs = await HotTransLog.save()
                res.json({ status: 200, data: transfertoken, message: "Successfully Done" })
            }

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },
    async trans_from_fw_pw_to_hw(req, res) {
        try {
            let remarksData = "";
            let Message = "";
            let pooldata = await get_All_Hot_Wallet_Transcation(req.body.id)

            if (pooldata.length == 0) {
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
            if (pooldata[0].networkDetails[0].libarayType == "Tronweb") {
                let NativeTransfer = await transferUtility.transferNativeTronWeb
                    (
                        pooldata[0].networkDetails[0].nodeUrl,
                        pooldata[0].feedwalletsDetails[0].address,
                        pooldata[0].feedwalletsDetails[0].privatekey,
                        pooldata[0].poolwalletsDetails[0].address,
                        pooldata[0].feelimit,
                    )

                await hotWalletTransLogs.findOneAndUpdate({ id: req.body.id },
                    {
                        $set:
                        {
                            status: NativeTransfer.status == 200 ? 5 : 6,
                            feeding_trans_id: NativeTransfer.status == 200 ? NativeTransfer.data : "",
                            remarks: remarksData.data,
                        }
                    },
                    { $new: true }
                )

                if (NativeTransfer.status == 400) {
                    return res.json({
                        status: 400, data:
                        {
                            "Type": "Feeding Wallet to Pool Wallet",
                            "from": pooldata[0].feedwalletsDetails[0].address,
                            "to": pooldata[0].poolwalletsDetails[0].address,
                            "coin": pooldata[0].networkDetails[0].network,
                        }, message: NativeTransfer.message
                    })
                }

                Message = NativeTransfer.status == 200 ? "Transfered To Feed Wallet to Hot Wwallet" : "There is an error in transfering the to Feed Wallets."
                remarksData = await transferUtility.push_The_Remarks(remarks, Message, "trans_from_fw_pw_to_hw")
                let transfertoken = await transferUtility.transfertokenTronWeb
                    (
                        pooldata[0].networkDetails[0].nodeUrl,
                        pooldata[0].networkDetails[0].contractAddress,
                        pooldata[0].poolwalletsDetails[0].address,
                        pooldata[0].poolwalletsDetails[0].privateKey,
                        pooldata[0].hotwalletsDetails[0].address,
                        balance.data.token_balance,
                    )

                if (transfertoken.status == 400) {
                    return res.json({
                        status: 400, data:
                        {
                            "Type": "Pool Wallet to Hot Wallet",
                            "from": pooldata[0].poolwalletsDetails[0].address,
                            "to": pooldata[0].hotwalletsDetails[0].address,
                            "coin": pooldata[0].networkDetails[0].network,
                        }, message: NativeTransfer.message
                    })
                }
                Message = transfertoken.status == 200 ? "Transfered To Hot Wallets" : "There is an error in transfering the to hotwallets."
                remarksData = await transferUtility.push_The_Remarks(remarks, Message, "trans_from_fw_pw_to_hw")
                let hotWalletTransLog = await hotWalletTransLogs.findOneAndUpdate({ id: req.body.id },
                    {
                        $set:
                        {
                            status: transfertoken.status == 200 ? 1 : 2,
                            trans_id: transfertoken.status == 200 ? transfertoken.data : "",
                            remarks: remarksData.data,
                        }
                    },
                    { $new: true }
                )
                let updatedpooldata = await get_All_Hot_Wallet_Transcation(req.body.id)
                res.json({ status: 200, data: updatedpooldata, message: "Successfully Done" })
            }
            else {

                res.json({ status: 200, data: balance, message: "Successfully Done" })
            }

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },
    async trans_from_feeding_Wallet_to_pool_wallet(req, res) {
        try {
            let pooldata = await get_All_Hot_Wallet_Transcation(req.body.id)
            if (pooldata.length == 0) {
                return res.json({ status: 400, data: {}, message: "Invalid ID" })
            }
            let addressFeedingResponse = await feedWalletController.addressFeedingFun(pooldata[0].networkDetails[0].id, pooldata[0].poolwalletsDetails[0].address, req.body.amount)
            const HotTransLog = new HotTransLogs({
                id: mongoose.Types.ObjectId(),
                feeding_trans_id: req.body.id,
                trans_id: addressFeedingResponse.status == 200 ? addressFeedingResponse.data.trans_id : " ",
                created_by: req.headers.authorization,
                created_at: new Date().toString(),
                type: "Feeding Wallet to Pool wallet"
            });
            let logs = await HotTransLog.save()

            let remarks = pooldata[0].remarks;
            let remarksData = await transferUtility.push_The_Remarks(remarks, JSON.stringify(addressFeedingResponse), "trans_from_feeding_Wallet_to_pool_wallet")
            await hotWalletTransLogs.findOneAndUpdate({ id: req.body.id },
                {
                    $set:
                    {
                        status: addressFeedingResponse.status == 200 ? 5 : 6,
                        feeding_trans_id: addressFeedingResponse.status == 200 ? addressFeedingResponse.data.trans_id : "",
                        feeding_wallet_id: addressFeedingResponse.status == 200 ? addressFeedingResponse.data.feeding_wallet_id : "",
                        remarks: remarksData.data,
                    }
                },
                { $new: true }
            )
            res.json({ status: 200, data: addressFeedingResponse, message: "Successfully Done" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },
    async Check_of_pool_wallet_address(req, res) {
        try {
            let pooldata = await get_All_Hot_Wallet_Transcation(req.body.id)
            if (pooldata.length == 0) {
                return res.json({ status: 400, data: {}, message: "Invalid ID" })
            }
            let address_balance = await feedWalletController.CheckBalanceOfAddress(
                pooldata[0].networkDetails[0].nodeUrl,
                pooldata[0].networkDetails[0].libarayType,
                pooldata[0].poolwalletsDetails[0].address,
                pooldata[0].networkDetails[0].contractAddress,
                pooldata[0].poolwalletsDetails[0].privateKey)
            res.json({ status: 200, data: address_balance, message: "Get The Balance" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },
    async confirm_the_pw_to_hw(req, res) {
        try {

            let pooldata = await get_All_Hot_Wallet_Transcation(req.body.id)
            if (pooldata.length == 0) {
                return res.json({ status: 400, data: {}, message: "Invalid ID" })
            }
            let address_balance = await feedWalletController.CheckBalanceOfAddress(
                pooldata[0].networkDetails[0].nodeUrl,
                pooldata[0].networkDetails[0].libarayType,
                pooldata[0].poolwalletsDetails[0].address,
                pooldata[0].networkDetails[0].contractAddress,
                pooldata[0].poolwalletsDetails[0].privateKey)
            if (address_balance.status == 400) {

                return res.json({ status: 400, data: address_balance, message: "Please Contact Admin For Transfering Pool wallet to hotwallet" })
            }

            if (address_balance.status == 200 && address_balance.token_balance > 0) {

                return res.json({ status: 400, data: address_balance, message: "Please Transfer the balance to hot wallet." })
            }

            let remarks = pooldata[0].remarks;
            let remarksData = await transferUtility.push_The_Remarks(remarks, "Verified The Transcation From Pool Wallet To Hot Wallet", "trans_from_feeding_Wallet_to_pool_wallet")
            await hotWalletTransLogs.findOneAndUpdate({ id: req.body.id },
                {
                    $set:
                    {
                        status: req.body.status,
                        remarks: remarksData.data,
                        verified_by: req.headers.authorization,
                        verified_at: new Date().toString(),
                    }
                },
                { $new: true }
            )
            let poolwallet = await poolWallets.findOneAndUpdate({ id: pooldata[0].poolwalletsDetails[0].id }, { $set: { status: 0, balance: 0 } })
            res.json({ status: 200, data: pooldata, message: "Error Please Check" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },


}
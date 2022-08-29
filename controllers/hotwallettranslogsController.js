const hotWalletTransLogs = require('../Models/hot_wallet_trans_logs');
const network = require('../Models/network');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
const poolWallets = require('../Models/poolWallet');
const Constant = require('../common/Constant');
//const commonFunction = require("../common/commonFunction")

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
            let gas_used  = 0
            let account_balance_in_ether = 0
            if(networkDetails.libarayType == "Web3")
            {
                const WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject.networkDetails[0].nodeUrl))
                if (addressObject.networkDetails[0].cointype == "Token") 
                {
                    const contract = new WEB3.eth.Contract(Constant.USDT_ABI, addressObject.networkDetails[0].contractAddress,);
                    // const transData =  await WEB3.eth.getTransaction(addressObject.trans_id)
                    gas_price = await WEB3.eth.getTransaction(addressObject.trans_id)
                    gas_used  = await WEB3.eth.getTransactionReceipt(addressObject.trans_id)
                    transaction_cost = gas_price.gasPrice * gas_used.gasUsed
                    console.log("getTranscationData ===================== ", transaction_cost)
                    console.log("getTranscationData ===================== ", gas_price)
                    console.log("getTranscationData ===================== ", gas_used)
                }
                else if (addressObject.networkDetails[0].cointype == "Native") {
                    const transData =  await WEB3.eth.getTransaction(addressObject.trans_id)
                    console.log("getTranscationData===================== ", transData)
                }
                 account_balance_in_ether = WEB3.utils.fromWei(transaction_cost.toString(), 'ether')
            }
          
            res.json({ status: 200, message: "Successfully", data: transaction_cost , "account_balance_in_ether":account_balance_in_ether })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

   
}
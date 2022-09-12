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
const transferUtility = require('../common/transferUtility');
require("dotenv").config()

async function get_All_Hot_Wallet_Transcation(id){
try{
    if(id == 0 ){
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
    else{
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
catch(error){
    console.log("===========error===========",error)
    return []
}
}

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
            let  pooldata = await get_All_Hot_Wallet_Transcation(0)
            console.log(pooldata)
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
        try 
        {
            let  pooldata = await get_All_Hot_Wallet_Transcation( req.body.id )
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
                
                    
                    if(transfertoken.status == 400)
                    {
                    return res.json({ status: 400, data: 
                    {
                     "Type"    : "Pool Wallet to Hot Wallet",
                     "from"    :  pooldata[0].poolwalletsDetails[0].address,
                     "to"      :  pooldata[0].hotwalletsDetails[0].address,
                     "coin"    :  pooldata[0].networkDetails[0].network,
                    }, message: NativeTransfer.message })
                }  

                console.log("transfertoken",transfertoken)
                let Message = transfertoken.status == 200 ? "Transfered To Hot Wallets" : "There is an error in transfering the to hotwallets."
                console.log("Message",Message)
                let remarksData = await transferUtility.push_The_Remarks(remarks, Message, "trans_from_pw_to_hw")
                console.log("remarksData",remarksData)
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
                //let poolwallet = await poolWallets.findOneAndUpdate({ id: pooldata[0].poolwalletsDetails[0].id }, { $set: { status: 0 , balance:0 } })
                let  updatedpooldata = await get_All_Hot_Wallet_Transcation(req.body.id)
                res.json({ status: 200, data: updatedpooldata, message: "Successfully Done" })
                
            }
            else 
            {
                res.json({ status: 200, data: balance, message: "Successfully Done" })
            }

        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },
    async trans_from_fw_pw_to_hw(req, res) {
        try {
            let  remarksData     = "";
            let  Message         = "";
            let  pooldata = await get_All_Hot_Wallet_Transcation(req.body.id)
            
            if ( pooldata.length == 0) 
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
            if (pooldata[0].networkDetails[0].libarayType == "Tronweb") 
            {
                console.log("==========balance============",balance)
                console.log("==========balance============",pooldata[0].feelimit)
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
                            status              : NativeTransfer.status == 200 ? 5 : 6, 
                            feeding_trans_id    : NativeTransfer.status == 200 ? NativeTransfer.data : "", 
                            remarks: remarksData.data,
                        }
                    },
                    { $new: true }
                )

                if(NativeTransfer.status == 400)
                {
                return res.json({ status: 400, data: 
                {
                 "Type"    : "Feeding Wallet to Pool Wallet",
                 "from"    :  pooldata[0].feedwalletsDetails[0].address,
                 "to"      :  pooldata[0].poolwalletsDetails[0].address,
                 "coin"    :  pooldata[0].networkDetails[0].network,
                }, message: NativeTransfer.message })
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
                
                if(transfertoken.status == 400)
                    {
                    return res.json({ status: 400, data: 
                    {
                     "Type"    : "Pool Wallet to Hot Wallet",
                     "from"    :  pooldata[0].poolwalletsDetails[0].address,
                     "to"      :  pooldata[0].hotwalletsDetails[0].address,
                     "coin"    :  pooldata[0].networkDetails[0].network,
                    }, message: NativeTransfer.message })
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
                //let poolwallet = await poolWallets.findOneAndUpdate({ id: pooldata[0].poolwalletsDetails[0].id }, { $set: { status: 0 , balance:0 } })
                let  updatedpooldata = await get_All_Hot_Wallet_Transcation(req.body.id)
                res.json({ status: 200, data: updatedpooldata, message: "Successfully Done" })
            }
            else 
            {
                res.json({ status: 200, data: balance, message: "Successfully Done" })
            }

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error Please Check" })
        }
    },



}
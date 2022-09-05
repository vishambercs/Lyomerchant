const feedWallets = require('../../Models/feedWallets');
const networks = require('../../Models/network');
const Utility = require('../../common/Utility');
const Constant = require('../../common/Constant');
const commonFunction = require('../../common/commonFunction');
var mongoose = require('mongoose');
var crypto = require("crypto");
const TronWeb = require('tronweb')
const { generateAccount } = require('tron-create-address')
const Web3 = require('web3');
require("dotenv").config()
var stringify = require('json-stringify-safe');
var TronStation = require('tronstation');


async function createFeedWalletsFun(network_id, created_by) {
    try {

        let network = await networks.findOne({ id: network_id })
        let feedWallet = await feedWallets.findOne({ network_id: network_id, status: 1 })
        let nodeurl = network.libarayType == "Web3" ? network.nodeUrl : "tronweb"
        let account = await Utility.GetAddress(nodeurl)
        if (feedWallet == null) {
            const feedWallet = new feedWallets({
                id: mongoose.Types.ObjectId(),
                network_id: network_id,
                address: account.address,
                privatekey: account.privateKey,
                status: 1,
                created_by: created_by,
            });
            let responnse = await feedWallet.save().then(async (val) => {
                return { status: 200, message: "Successfully", data: val }
            }).catch(error => {
                console.log(error)
                return { status: 400, data: {}, message: error }
            })
            return responnse

        }
        else {
            return { status: 400, data: {}, message: "Already feed wallets exist." }
        }
    }
    catch (error) {
        console.log(error)
        return { status: 400, data: {}, message: "Error" }
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
            format_native_balance = tronWeb.toDecimal(format_native_balance)
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
async function addressFeedingFun(network_id, poolwalletAddress, amount) {
    let from_wallet = {};
    let response = {}
    let hotWallet = {};
    let created_by = 0
    try {
        from_wallet = await feedWallets.aggregate([
            { $match: { "network_id": network_id, status: 1, } },
            { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } },
        ])

        console.log("from_wallet", from_wallet)
        if (from_wallet != null) {
            let balance = await CheckBalanceOfAddress(
                from_wallet[0].networkDetails[0].nodeUrl,
                from_wallet[0].networkDetails[0].libarayType,
                from_wallet[0].address,
                from_wallet[0].networkDetails[0].contractAddress,
                from_wallet[0].privatekey)
            console.log("email_response", balance)
            console.log("email_response", balance.status == 200 && balance.native_balance == 0)
            if (balance.status == 200 && balance.data.native_balance == 0) {
                var emailTemplateName =
                {
                    "emailTemplateName": "feedingwallet.ejs",
                    "to": process.env.FEEDING_EMAIL_REMINDER,
                    "subject": "Feed The Wallet",
                    "templateData": { "address": from_wallet[0].address, "network": from_wallet[0].networkDetails[0].network }
                }
                let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
                console.log("email_response", email_response)
                response = { status: 400, message: "We have informed the admin", data: {} }
                return response
            }
            if (from_wallet[0].networkDetails[0].libarayType == "Web3") {
                const web3 = new Web3(new Web3.providers.HttpProvider(from_wallet[0].networkDetails[0].nodeUrl))
                const pubkey = await web3.eth.accounts.privateKeyToAccount(from_wallet[0].privatekey).address;
                const balance = await web3.eth.getBalance(pubkey);
                console.log("❗ balance ", balance)
                const currentGas = await web3.eth.getGasPrice();
                console.log("❗ currentGas ", currentGas)
                console.log("❗ currentGas ", web3.utils.fromWei(currentGas, 'ether'))
                const requiredGasPrice = await web3.eth.estimateGas({ to: poolwalletAddress });
                console.log("❗ requiredGasPrice ", requiredGasPrice)
                const gas = currentGas * requiredGasPrice;
                console.log("❗ gas ", gas)
                const nonce = await web3.eth.getTransactionCount(pubkey, 'latest');
                const transaction =
                {
                    'to': poolwalletAddress,
                    'value': web3.utils.toWei(amount, 'ether'),
                    'gas': requiredGasPrice,
                    'gasPrice': currentGas,
                    'nonce': nonce
                };
                const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privatekey);
                web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                    if (!error) {
                        console.log("🎉 The hash of your transaction is: ", hash);
                        response = { status: 200, message: "success", data: hash, address: poolwalletAddress, "poolWalletDetails": from_wallet }
                        // res.json(response)
                        return response

                    } else {
                        console.log("❗ Something went wrong while submitting your transaction: ", error)
                        // response = { status: 200, message: "success", data: hash, "poolWalletDetails": from_wallet }
                        response = { status: 400, message: "❗ Something went wrong while submitting your transaction: " + error, data: hash, address: poolwalletAddress, "poolWalletDetails": from_wallet }
                        // res.json(response)
                        return response
                    }
                });

            }
            else {
                console.log("poolwalletAddress===============", poolwalletAddress)
                console.log("poolwalletAddress===============", from_wallet)
                console.log("poolwalletAddress===============", from_wallet[0].privatekey)
                const HttpProvider = TronWeb.providers.HttpProvider;
                const fullNode = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const solidityNode = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const eventServer = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, from_wallet[0].privatekey);
                let contract = await tronWeb.contract().at(from_wallet[0].networkDetails[0].contractAddress);
                let result = await contract.transfer(poolwalletAddress, amount).send({ feeLimit: from_wallet[0].networkDetails[0].gaslimit })
                response = { status: 200, message: "success", data: result, "poolWalletDetails": from_wallet }
                // res.json(response)
                return response
            }

        }
        else {

            return { status: 400, message: "Network is not supported", data: null }
        }

    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        return { status: 400, data: {}, message: error.message, "poolWalletDetails": from_wallet }
    }
}



module.exports =
{
    createFeedWalletsFun: createFeedWalletsFun,
    CheckBalanceOfAddress: CheckBalanceOfAddress,
    addressFeedingFun: addressFeedingFun,
    async createFeedWallets(req, res) {
        try {
            let feedwallet = await createFeedWalletsFun(req.body.network_id, req.body.created_by)
            res.json(feedwallet)
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async allFeedWallets(req, res) {
        try {
            let status = (req.body.status == undefined || req.body.status == "") ? 1 : req.body.status
            let fromWallets = await feedWallets.aggregate([
                { $match: { status: status, } },
                { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } },
            ])
            res.json({ status: 200, data: fromWallets, message: "Success" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async deleteWallets(req, res) {
        try {
            await feedWallets.findOneAndUpdate({ 'id': req.body.id },
                {
                    $set:
                    {
                        status: 0,
                        deleted_by: req.body.deleted_by,
                        deleted_at: Date.now()
                    }
                }).then(async (val) => {
                    if (val != null) {

                        res.json({ status: 200, message: "Successfully Deleted", data: {} })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async addressFeeding(req, res) 
    {
        try 
        {
        let addressFeedingResponse  =  await addressFeedingFun(req.body.network_id, req.body.poolwalletAddress, req.body.amount)
        res.json(addressFeedingResponse)
        } 
        catch (error) {
                console.log("Message %s sent: %s", error);
                res.json({ status: 400, data: {}, message: error.message, "poolWalletDetails": from_wallet })
            }
        

        // let from_wallet = {};
        // let response = {}
        // let hotWallet = {};
        // let created_by = 0
        // let poolwalletAddress = ""
        // let network_id = ""
        // let amount = ""
        // try {
        //     network_id = req.body.network_id
        //     poolwalletAddress = req.body.poolwalletAddress
        //     amount = req.body.amount
        //     from_wallet = await feedWallets.aggregate([
        //         { $match: { "network_id": network_id, status: 1, } },
        //         { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } },
        //     ])

        //     console.log("from_wallet", from_wallet)
        //     if (from_wallet != null) {
        //         let balance = await CheckBalanceOfAddress(
        //             from_wallet[0].networkDetails[0].nodeUrl,
        //             from_wallet[0].networkDetails[0].libarayType,
        //             from_wallet[0].address,
        //             from_wallet[0].networkDetails[0].contractAddress,
        //             from_wallet[0].privatekey)
        //         console.log("email_response", balance)
        //         console.log("email_response", balance.status == 200 && balance.native_balance == 0)
        //         if (balance.status == 200 && balance.data.native_balance == 0) {
        //             var emailTemplateName =
        //             {
        //                 "emailTemplateName": "feedingwallet.ejs",
        //                 "to": process.env.FEEDING_EMAIL_REMINDER,
        //                 "subject": "Feed The Wallet",
        //                 "templateData": { "address": from_wallet[0].address, "network": from_wallet[0].networkDetails[0].network }
        //             }
        //             let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
        //             console.log("email_response", email_response)
        //             response = { status: 400, message: "We have informed the admin", data: {} }
        //             return res.json(response)
        //         }
        //         if (from_wallet[0].networkDetails[0].libarayType == "Web3") {
        //             const web3 = new Web3(new Web3.providers.HttpProvider(from_wallet[0].networkDetails[0].nodeUrl))
        //             const pubkey = await web3.eth.accounts.privateKeyToAccount(from_wallet[0].privatekey).address;
        //             const balance = await web3.eth.getBalance(pubkey);
        //             console.log("❗ balance ", balance)
        //             const currentGas = await web3.eth.getGasPrice();
        //             console.log("❗ currentGas ", currentGas)
        //             console.log("❗ currentGas ", web3.utils.fromWei(currentGas, 'ether'))
        //             const requiredGasPrice = await web3.eth.estimateGas({ to: poolwalletAddress });
        //             console.log("❗ requiredGasPrice ", requiredGasPrice)
        //             const gas = currentGas * requiredGasPrice;
        //             console.log("❗ gas ", gas)
        //             const nonce = await web3.eth.getTransactionCount(pubkey, 'latest');
        //             const transaction =
        //             {
        //                 'to': poolwalletAddress,
        //                 'value': web3.utils.toWei(amount, 'ether'),
        //                 'gas': requiredGasPrice,
        //                 'gasPrice': currentGas,
        //                 'nonce': nonce
        //             };
        //             const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privatekey);
        //             web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
        //                 if (!error) {
        //                     console.log("🎉 The hash of your transaction is: ", hash);
        //                     response = { status: 200, message: "success", data: hash, address: poolwalletAddress, "poolWalletDetails": from_wallet }
        //                     res.json(response)

        //                 } else {
        //                     console.log("❗ Something went wrong while submitting your transaction: ", error)
        //                     // response = { status: 200, message: "success", data: hash, "poolWalletDetails": from_wallet }
        //                     response = { status: 400, message: "❗ Something went wrong while submitting your transaction: " + error, data: hash, address: poolwalletAddress, "poolWalletDetails": from_wallet }
        //                     res.json(response)
        //                 }
        //             });

        //         }
        //         else {
        //             console.log("poolwalletAddress===============", poolwalletAddress)
        //             console.log("poolwalletAddress===============", from_wallet)
        //             console.log("poolwalletAddress===============", from_wallet[0].privatekey)
        //             const HttpProvider = TronWeb.providers.HttpProvider;
        //             const fullNode = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
        //             const solidityNode = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
        //             const eventServer = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
        //             const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, from_wallet[0].privatekey);
        //             let contract = await tronWeb.contract().at(from_wallet[0].networkDetails[0].contractAddress);
        //             let result = await contract.transfer(poolwalletAddress, amount).send({ feeLimit: from_wallet[0].networkDetails[0].gaslimit })
        //             response = { status: 200, message: "success", data: result, "poolWalletDetails": from_wallet }
        //             res.json(response)
        //         }

        //     }
        //     else {

        //         res.json({ status: 400, message: "Network is not supported", data: null })
        //     }

        // }
        // catch (error) {
        //     console.log("Message %s sent: %s", error);

        //     res.json({ status: 400, data: {}, message: error.message, "poolWalletDetails": from_wallet })
        // }
    },

}


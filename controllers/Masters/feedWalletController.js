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
const emailSending = require('../../common/emailSending');
const CryptoAccount     = require("send-crypto");
const axios             = require('axios')
async function createFeedWalletsFun(network_id, created_by) {
    try {

        let network = await networks.findOne({ id: network_id })
        let feedWallet = await feedWallets.findOne({ network_id: network_id, status: 1 })
        let nodeurl = network.libarayType == "Web3" ? network.nodeUrl : "tronweb"
        let account = await GetAddress(nodeurl)
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

async function CheckBalanceOfAddress(Nodeurl, Type, cointype,Address, ContractAddress = "", privateKey = "") 
{
    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {
        if (Type == "Web3" && cointype == "Token") 
        {
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
            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if (Type == "Web3" && cointype == "Native") 
        {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            let native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            let format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            let balanceData = { 
                "token_balance": native_balance, 
                "format_token_balance": format_native_balance, 
                "native_balance": native_balance, 
                "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if(Type == "Tronweb")
        {
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
        else if (Type == "btcnetwork") 
        {
            const account = new CryptoAccount(privateKey);
            console.log("===========CryptoAccount account===============",account)
            const address = await account.address("BTC")
            console.log("===========CryptoAccount address===============",address)
            const balance = await account.getBalance("BTC");
            console.log("===========CryptoAccount balance===============",balance)
            let balanceData = { "token_balance": balance, "format_token_balance": balance, "native_balance": balance, "format_native_balance": balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
    }
    catch (error) 
    {
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
        if (from_wallet != null) {
            let balance = await CheckBalanceOfAddress(
                from_wallet[0].networkDetails[0].nodeUrl,
                from_wallet[0].networkDetails[0].libarayType,
                from_wallet[0].networkDetails[0].cointype,
                from_wallet[0].address,
                from_wallet[0].networkDetails[0].contractAddress,
                from_wallet[0].privatekey)

            if (balance.status == 200 && balance.data.native_balance < amount) {
                var emailTemplateName =
                {
                    "emailTemplateName": "feedingwallet.ejs",
                    "to": process.env.FEEDING_EMAIL_REMINDER,
                    "subject": "Feed The Wallet",
                    "templateData": { "address": from_wallet[0].address, "network": from_wallet[0].networkDetails[0].network }
                }
                let email_response = await emailSending.sendEmailFunc(emailTemplateName)
                console.log("email_response", email_response)
                let datavalues = { "address": poolwalletAddress, "trans_id": "0", "transoutput": "0", "feeding_wallet_id": from_wallet[0].id }
                response = { status: 400, message: "We have informed the admin", data: datavalues }
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
                console.log("❗ amount ", amount)
                console.log("❗ amount ", web3.utils.toWei(amount.toString(), 'ether'))
                const nonce = await web3.eth.getTransactionCount(pubkey, 'latest');
                const transaction =
                {
                    'to': poolwalletAddress,
                    'value': web3.utils.toWei(amount.toString(), 'ether'),
                    'gas': requiredGasPrice,
                    'gasPrice': currentGas,
                    'nonce': nonce
                };
                const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privatekey);
                let responseData = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                    if (!error) {
                        console.log("🎉 The hash of your transaction is: ", hash);
                        let datavalues = { "address": poolwalletAddress, "trans_id": hash, "transoutput": {}, "feeding_wallet_id": "0" }
                        response = { status: 200, message: "success", data: datavalues }
                        // res.json(response)
                        return response

                    } else {
                        console.log("❗ Something went wrong while submitting your transaction: ", error)
                        // response = { status: 200, message: "success", data: hash, "poolWalletDetails": from_wallet }
                        let datavalues = { "address": poolwalletAddress, "trans_id": "0", "transoutput": {}, "feeding_wallet_id": "0" }
                        response =
                        {
                            status: 400,
                            message: "❗ Something went wrong while submitting your transaction: " + error,
                            data: datavalues
                        }
                        return response
                    }
                });
                let datavalues = { "address": poolwalletAddress, "trans_id": responseData.transactionHash, "transoutput": responseData, "feeding_wallet_id": from_wallet[0].id }
                response = { status: 200, message: "success", data: datavalues }
                return response

            }
            else {
                const HttpProvider = TronWeb.providers.HttpProvider;
                const fullNode = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const solidityNode = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const eventServer = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, from_wallet[0].privatekey);
                const tradeobj = await tronWeb.transactionBuilder.sendTrx(poolwalletAddress, tronWeb.toSun(amount), from_wallet[0].address);
                const signedtxn = await tronWeb.trx.sign(tradeobj, from_wallet[0].privatekey);
                const receipt = await tronWeb.trx.sendRawTransaction(signedtxn).then(async (output) => {
                    let datavalues = { "address": poolwalletAddress, "trans_id": output.txid, "transoutput": output, "feeding_wallet_id": from_wallet[0].id }
                    response = { status: 200, message: "success", data: datavalues }
                });
                return response
            }
        }
        else {
            let datavalues = { "address": poolwalletAddress, "trans_id": "0", "transoutput": {}, "feeding_wallet_id": from_wallet[0].id }
            return { status: 400, message: "Network is not supported", data: datavalues }
        }

    }
    catch (error) {
        console.log("feed wallet Controller addressFeedingFun", error);
        let datavalues = { "message": error, "address": poolwalletAddress, "trans_id": "0", "transoutput": {}, "feeding_wallet_id": "0" }
        return { status: 400, data: datavalues, message: error.message, }
    }
}
async function calculateGasFee(Nodeurl, Type, fromAddress, toAddress, amount, ContractAddress = "") {
    let gasAmount = 0
    let gasPrice = 0
    try {

        if (Type == "Web3") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            gasPrice = await WEB3.eth.getGasPrice();
            if (ContractAddress != "") {
                const contract = new WEB3.eth.Contract(Constant.GAS_ABI, ContractAddress);
                gasAmount = await contract.methods.transfer(toAddress, WEB3.utils.toWei(amount.toString())).estimateGas({ from: fromAddress });

                return { status: 200, data: { "fee": (gasPrice * gasAmount), "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
            }
            else {
                gasAmount = await WEB3.eth.estimateGas({ to: toAddress, from: fromAddress, value: Web3.utils.toWei(amount.toString(), 'ether'), });

                return { status: 200, data: { "fee": (gasPrice * gasAmount), "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
            }
        }
        else {


            return { status: 200, data: { "fee": "2000000", "gasprice": gasPrice, "gasamount": gasAmount }, message: "sucess" }
        }
    }
    catch (error) {
        console.log(error)
        return { status: 400, data: { "fee": (gasPrice * gasAmount), "gasprice": gasPrice, "gasamount": gasAmount }, message: "Error" }
    }
}

module.exports =
{
    createFeedWalletsFun: createFeedWalletsFun,
    CheckBalanceOfAddress: CheckBalanceOfAddress,
    addressFeedingFun: addressFeedingFun,
    calculateGasFee: calculateGasFee,
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

    async createFeedingwalletby(req, res) {
        try {
            const feedWallet = new feedWallets({
                id          : mongoose.Types.ObjectId(),
                network_id  : req.body.network_id ,
                address     : req.body.address ,
                privatekey  : req.body.privatekey ,
                status      : 1,
                created_by  : req.headers.authorization,
            });
            let responnse = await feedWallet.save().then(async (val) => {
                return { status: 200, message: "Successfully", data: val }
            }).catch(error => {
                console.log(error)
                return { status: 400, data: {}, message: error }
            })
            res.json({ status: 200, data: responnse, message: "message" })
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
                { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } 
            
            },
            {
                "$project": {
                    "privatekey": 0,
                }
            }
            ])
            res.json({ status: 200, data: fromWallets, message: "Success" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async checkbalance(req, res) {
        try {
          
            let fromWallets = await feedWallets.aggregate([
                { $match: { id: req.body.id } },
                { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } },
            ])
            if(fromWallets.length == 0)
            {
                res.json({ status: 400, data: {}, message: "Invalid id" })
            }
            let balance = await CheckBalanceOfAddress(fromWallets[0].networkDetails[0].nodeUrl, fromWallets[0].networkDetails[0].libarayType,fromWallets[0].networkDetails[0].cointype, fromWallets[0].address, fromWallets[0].networkDetails[0].contractAddress, fromWallets[0].privatekey) 
          
            res.json(balance)
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
    async addressFeeding(req, res) {
        try {
            let addressFeedingResponse = await addressFeedingFun(req.body.network_id, req.body.poolwalletAddress, req.body.amount)
            res.json(addressFeedingResponse)
        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            res.json({ status: 400, data: {}, message: error.message, "poolWalletDetails": from_wallet })
        }


    },

    async checkbtcbalance(req, res) {
        try {
            let COINGECKO_URL = "http://blockchain.info/q/addressbalance/" + req.body.address
            response = {}
            await axios.get(COINGECKO_URL, {
                params: {},
                headers: {}
            }).then(res => {
                var stringify_response = stringify(res)
                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
            })
                .catch(error => {
                    console.error("Error", error)
                    var stringify_response = stringify(error)
                    response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
                })
            var stringify_response = JSON.parse(response.data)
            let balance_format = parseFloat(stringify_response.data) / 100000000
            res.json({ status: 200, data: stringify_response.data, "balance_format": balance_format, message: "Currency API Balance" })
        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            res.json({ status: 400, data: {}, message: error.message, })
        }


    },
    async checktransstatus(req, res) {
        try {
            let COINGECKO_URL = "https://www.blockchain.com/btc/tx/" + req.body.address
            response = {}
            await axios.get(COINGECKO_URL, {
                params: {},
                headers: {}
            }).then(res => {
                var stringify_response = stringify(res)
                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
            })
                .catch(error => {
                    console.error("Error", error)
                    var stringify_response = stringify(error)
                    response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
                })
            var stringify_response = JSON.parse(response.data)
            let balance_format = parseFloat(stringify_response.data) / 100000000
            res.json({ status: 200, data: stringify_response.data, "balance_format": balance_format, message: "Currency API Balance" })
        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            res.json({ status: 400, data: {}, message: error.message, })
        }


    },
    async transferbtcoin(req, res) {
        try {
            const CryptoAccount = require("send-crypto");


            const privateKey = "4def9f252b3f261dd5d281d830bf560b1a3c733d0c59c4f9d8e565fd13efe3b8" || CryptoAccount.newPrivateKey();

            // "1P4c1K3U6YHbTP52xQsdtkgWDXLzJHJkDQ"
            const account = new CryptoAccount(privateKey);
            const address = await account.address("BTC")
            console.log(await account.address("BTC"));
            console.log(await account.getBalance("BTC"));

            const txHash = await account
            .send("13nrd6a4duP5rVUqcpPpUfHvbKHm83TdEd", 0.0001, "BTC")
            .on("transactionHash", console.log)
            .on("confirmation", console.log);

            res.json({ status: 200, data: { "myAddress": address, "privateKey": privateKey }, message: "Currency API Balance" })

            
        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            res.json({ status: 400, data: {}, message: error.message, })
        }


    },
    async transferbtcore(req, res) {
        try {
            // const CryptoAccount = require("send-crypto");
            // const privateKey = "4def9f252b3f261dd5d281d830bf560b1a3c733d0c59c4f9d8e565fd13efe3b8" || CryptoAccount.newPrivateKey();
            // // "1P4c1K3U6YHbTP52xQsdtkgWDXLzJHJkDQ"
            // const account = new CryptoAccount(privateKey);
            // const address = await account.address("BTC")
            // console.log(await account.address("BTC"));
            // console.log(await account.getBalance("BTC"));

            // const txHash = await account
            // .send("13nrd6a4duP5rVUqcpPpUfHvbKHm83TdEd", 0.0001, "BTC")
            // .on("transactionHash", console.log)
            // .on("confirmation", console.log);
            const Client = require('bitcoin-core');
            const client = new Client({ network: 'regtest' });

            res.json({ status: 200, data: { "myAddress": address, "privateKey": privateKey }, message: "Currency API Balance" })

            
        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            res.json({ status: 400, data: {}, message: error.message, })
        }
    },
    // async transferbtcoin(req, res) {
    //     try {

    //         const  privatekey = CryptoAccount.newPrivateKey(); 
    //         console.log("new private key",privatekey);
    //         const account = new CryptoAccount(privatekey,{
    //             network: "testnet",
    //         });
    //         console.log(await account.address("BTC"));
    //         // console.log(privatekey);
    //         // const account = new CryptoAccount("038180d2f81c8d930ea18fb2aa0820f6771e66100f9a70aaad65a3e6417b4f0e90");
           
            
    //         // console.log(await account.getBalance("BTC"));
    //         // const txHash = await account.send("1D2onCCjUF9JVaw2JTK2qUBfvVq9wAXrAL", 0.01, "BTC").on("transactionHash", console.log).on("confirmation", console.log);
    //         // console.log("txHash",txHash);
    //         res.json({ status: 200, data: "Saved", message: "Currency API Balance" })
    //     }
    //     catch (error) {
    //         console.log("Message %s sent: %s", error);
    //         res.json({ status: 400, data: {}, message: error.message, })
    //     }


    // },

    
}


const poolWallet = require('../Models/poolWallet');
const network = require('../Models/network');
const feedWallets = require('../Models/feedWallets');
const hotWallets = require('../Models/hotWallets');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
var crypto = require("crypto");
const { create } = require('lodash');
const { GetAddress } = require('../common/Utility');
require("dotenv").config()
const { generateAccount } = require('tron-create-address')
const Bitcoin               = require('bitcoin-address-generator');
const feedWalletController  = require('../controllers/Masters/feedWalletController');
const CryptoAccount         = require("send-crypto");
const TronWeb = require('tronweb')
const axios = require('axios')
async function Save_Address_Data(network_details){
    
    if (network_details.libarayType == "Web3") {
        let account = await Utility.GetAddress(network_details.nodeUrl)
        const poolWalletItem = new poolWallet({  networkDetails : network_details._id,remarks: "Created at Run Time: " + (new Date().toString()), id: crypto.randomBytes(20).toString('hex'), network_id: network_details.id, address: account.address, privateKey: account.privateKey, });
        let val = await poolWalletItem.save()
        return val
    }
    else if (network_details.libarayType == "Tronweb") {
        const { address, privateKey } = generateAccount()
        const poolWalletItem = new poolWallet({  networkDetails : network_details._id,remarks: "Created at Run Time: " + (new Date().toString()), id: crypto.randomBytes(20).toString('hex'), network_id:  network_details.id, address: address, privateKey: privateKey, });
        let val = await poolWalletItem.save()
        return val
    }
    else if (network_details.libarayType == "btcnetwork") {
        let URL = process.env.BTC_ADDRESS_GENERATION
        let hotwallet = await hotWallets.findOne({network_id :  network_details.id , status : 1})
        URL += "action=createChild_BTC_Wallet"
        URL += "&master_BTC_Wallet="+hotwallet.address
        let btc_address = await Utility.Get_RequestByAxios(URL,{},{})
        let btcaddress = JSON.parse(btc_address.data).data
        let address    = btcaddress.errorCode == 0 ? btcaddress.data.child_BTC_WalletAddress : null
        let val   = null
        if(address != null)
        { 
        const poolWalletItem  = new poolWallet({ 
            remarks: "Created at Run Time: " + (new Date().toString()), 
            id: crypto.randomBytes(20).toString('hex'), 
            network_id:  network_details.id, 
            address: address, 
            networkDetails : network_details._id,
            privateKey: " ", });
        val     = await poolWalletItem.save()
        }
        return val
    }
}
async function Get_RequestByAxios(URL, parameters, headers) {
    response = {}
    await axios.get(URL, {
        params: parameters,
        headers: headers
    }).then(res => {
        var stringify_response = `${res}`
        response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
    })
        .catch(error => {
            console.error("Error", error)
            var stringify_response = `${error}`
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
    return response;
}
async function CheckAddress(Nodeurl, Type, cointype, Address, ContractAddress = "") {
    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {
        if (Type == "Web3" && cointype == "Token") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            if (ContractAddress != "") {
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
                token_balance = await contract.methods.balanceOf(Address.toLowerCase()).call();
                let decimals = await contract.methods.decimals().call();
                format_token_balance = parseFloat(token_balance) / (1 * 10 ** decimals)
            }
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')

            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if (Type == "Web3" && cointype == "Native") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            let balanceData = { "token_balance": native_balance, "format_token_balance": format_native_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if (Type == "btcnetwork") {

            let url = process.env.BTC_BALANCE_CHECK_URL + Address
            let balance = await Get_RequestByAxios(url, {}, {})
            let balanceData = {}
            let message = ""
            let status = ""
            if (balance.status == 200) {
                let btcaddress = JSON.parse(balance.data).data
                let bal = btcaddress.errorCode == 0 ? +(btcaddress.data.wallet_Balance) : 0.0
                let status = btcaddress.errorCode == 0 ? 200 : 400
                let message = btcaddress.errorCode == 0 ? "sucess" : "error"
                balanceData = { "token_balance": bal, "format_token_balance": bal, "native_balance": bal, "format_native_balance": bal }
                message = "success";
                status = balance.status;
            }
            else {
                balanceData = { "token_balance": 0, "format_token_balance": 0, "native_balance": 0, "format_native_balance": 0 }
                message = "Error";
                status = balance.status;
            }

            return { status: status, data: balanceData, message: message }
        }
        else {
            const HttpProvider      = TronWeb.providers.HttpProvider;
            const fullNode          = new HttpProvider(Nodeurl);
            const solidityNode      = new HttpProvider(Nodeurl);
            const eventServer       = new HttpProvider(Nodeurl);
            const tronWeb           = new TronWeb(fullNode, solidityNode, eventServer, "7b93504b6fc497e8ffbc94b73326a9b90605d55598b936b07467068d5b768991");
            let contract            = await tronWeb.contract().at(ContractAddress);
            native_balance          = await tronWeb.trx.getBalance(Address)
            token_balance           = await contract.balanceOf(Address).call();
            let decimals            = await contract.decimals().call();
            format_token_balance    = tronWeb.toBigNumber(token_balance)
            format_token_balance    = tronWeb.toDecimal(format_token_balance)
            let newformat_balance  = parseFloat(format_token_balance)/parseFloat(`1e${decimals}`)
            format_token_balance = newformat_balance
            let newformat_token_balance         = parseInt(format_token_balance)/parseFloat(`1e${decimals}`)
            format_native_balance               = tronWeb.toBigNumber(native_balance)
            format_native_balance               = tronWeb.toDecimal(format_native_balance)
            format_native_balance               = tronWeb.fromSun(format_native_balance)
            let balanceData                     = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }

    }
    catch (error) {
        console.log(error)
        let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
        return { status: 400, data: balanceData, message: "Error" }
    }
}
module.exports =
{


    async create_Pool_Wallet(req, res) {
        try {
            let network_details = await network.findOne({ 'id': req.body.network_id })
            let account = await Utility.GetAddress(network_details.nodeUrl)
            const poolWalletItem = new poolWallet({ id: crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
            poolWalletItem.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
            }).catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async all_pool_wallet(req, res) {
        try {
            await poolWallet.aggregate([{
                $lookup: {
                    from: "networks", // collection to join
                    localField: "network_id",//field from the input documents
                    foreignField: "id",//field from the documents of the "from" collection
                    as: "walletNetwork"// output array field
                },

            },
            {
                "$project":
                {
                    "privateKey": 0,

                }
            }
            ]).then(async (data) => {

                res.json({ status: 200, message: "Pool Wallet", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_Pool_Wallet_100(req, res) {
        try {
            let network_details = await network.findOne({ 'id': req.body.network_id })
            for (let i = 0; i < 10; i++) {
                let account = await Utility.GetAddress(network_details.nodeUrl)
                const poolWalletItem = new poolWallet({ id: crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
                poolWalletItem.save().then(async (val) => {
                    console.log("val", i, val)
                    // res.json({ status: 200, message: "Successfully", data: val })
                }).catch(error => {
                    console.log("val", error)
                    // res.json({ status: 400, data: {}, message: error }) 

                })

            }
            res.json({ status: 200, message: "Successfully", data: {} })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }

    },
    async getPoolWalletWithBalance(req, res) {
        try {
            await poolWallet.aggregate([
                { $match: { balance: { $ne: "0" } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "network_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    },

                },
                {
                    "$project":
                    {
                        "privateKey": 0,

                    }
                }
            ]).then(async (data) => {
                res.json({ status: 200, message: "Pool Wallet", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async getUsedPercentage(req, res) {
        try {

            let usedPoolWallets = await poolWallet.aggregate([
                { "$match": { "status": 1 } },
                { "$group": { "_id": "$network_id", "total": { "$sum": 1 } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    }
                },

            ])
            let freePoolWallets = await poolWallet.aggregate([
                { "$match": { "status": 0 } },
                { "$group": { "_id": "$network_id", "total": { "$sum": 1 } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    }
                },

            ])
            let totalPoolWallets = await poolWallet.aggregate([
                { "$group": { "_id": "$network_id", "total": { "$sum": 1 } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    }
                },
            ])

            let orphanePoolWallets = await poolWallet.aggregate([
                { "$match": { "status": 3 } },
                { "$group": { "_id": "$network_id", "total": { "$sum": 1 } } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    }
                },
            ])
            res.json({ status: 200, data: { "orphanePoolWallets": orphanePoolWallets, "totalPoolWallets": totalPoolWallets, "usedPoolWallets": usedPoolWallets, "freePoolWallets": freePoolWallets }, message: "Pool Wallets Statics" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_bulk_pool_wallet(req, res) {
        try {

            let network_details = await network.findOne({ 'id': req.body.network_id })
            for (let i = 0; i < req.body.total; i++) {
                let account = await Utility.GetAddress(network_details.nodeUrl)
                const poolWalletItem = new poolWallet({ created_by: req.body.created_by, id: crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
                poolWalletItem.save().then(async (val) => {
                    console.log("val", i, val)
                    // res.json({ status: 200, message: "Successfully", data: val })
                }).catch(error => {
                    console.log("val", error)
                    // res.json({ status: 400, data: {}, message: error }) 

                })
            }
            res.json({ status: 200, message: "Successfully", data: {} })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }

    },
    
    async getPoolWalletID(network_id) {
        try {
        
            let network_details = await network.findOne({ 'id': network_id })
            // let account = await poolWallet.findOne({ network_id: network_id, status: 0 })
            // let account = await poolWallet.find({ network_id: network_id, status: 0 }).sort({'_id': 1}).limit(1)
            let account = null
            // account = account.length > 0 ? account[0] :  null
            if (account != null) 
            {
              let val_data =  await CheckAddress(network_details.nodeUrl, network_details.libarayType,account.address, network_details.contractAddress) 
              if( val_data.data.token_balance != 0)
            {
               let val = await Save_Address_Data(network_details)
               return val; 
            }
            return account; 
            }
            else 
            {

                let val_data =  await   Save_Address_Data(network_details)
                return val_data;
            }
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
    async generateThePoolWalletAddress(req, res) {
        try {
            let network_id = req.body.network_id;
            let network_details = await network.findOne({ 'id': req.body.network_id })
            let account = await poolWallet.findOne({ network_id: req.body.network_id, status: 0 })
            if (account == null) {
                if (network_details.libarayType == "Web3") 
                {
                    let account = await Utility.GetAddress(network_details.nodeUrl)
                    const poolWalletItem = new poolWallet({ remarks: "Created at Run Time: " + new Date().toString(), id: crypto.randomBytes(20).toString('hex'), network_id: network_id, address: account.address, privateKey: account.privateKey, });
                    let val = await poolWalletItem.save()
                    res.json({ status: 200, data: val, message: "" })
                }
                else if (network_details.libarayType == "Tronweb") {
                    const { address, privateKey } = generateAccount()
                    const poolWalletItem = new poolWallet({ remarks: "Created at Run Time: " + new Date().toString(), id: crypto.randomBytes(20).toString('hex'), network_id: network_id, address: address, privateKey: privateKey, });
                    let val = await poolWalletItem.save()
                    // return val
                    res.json({ status: 200, data: val, message: "" })
                }
                else if (network_details.libarayType == "btcnetwork") {
                    console.log(network_details.libarayType)
                    const privateKey =  CryptoAccount.newPrivateKey();
                    const address = await account.address("BTC")
                    const poolWalletItem = new poolWallet({ remarks: "Created at Run Time: " + (new Date()).toString(), id: crypto.randomBytes(20).toString('hex'), network_id: network_id, address: address, privateKey: privateKey, });
                    let val = await poolWalletItem.save()
                    res.json({ status: 200, data: val, message: "" })
                }
            }
            else {

                res.json({ status: 200, data: account, message: "" })
            }
        }
        catch (error) {
            console.log("generateThePoolWalletAddress", error)
            res.json({ status: 400, data: {}, message: error })
        }
    },
    async allwalletsWithStatus(req, res) {
        try {
            await poolWallet.aggregate([
                { $match: { status: parseInt(req.body.status) } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "network_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    },

                },
                {
                    "$project":
                    {
                        "privateKey": 0,

                    }
                }
            ]).then(async (data) => {

                res.json({ status: 200, message: "Pool Wallet", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            return null
            res.json({ status: 400, data: {}, message: error })
        }
    },
    async GetBalanceOFAddress(req, res) {
        try {

            await poolWallet.aggregate([
                { $match: { id: req.body.id } },
                {
                    $lookup: {
                        from: "networks", // collection to join
                        localField: "network_id",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "walletNetwork"// output array field
                    },

                },
                {
                    "$project":
                    {
                        "privateKey": 0,

                    }
                }
            ]).then(async (data) => {
                res.json({ status: 200, message: "Pool Wallet", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: error })
        }
    },
    async savePoolWallet(network_id,address) 
    {
        try {
        
            const poolWalletItem  = new poolWallet({ 
                remarks: "Created at Run Time: " + (new Date().toString()), 
                id: crypto.randomBytes(20).toString('hex'), 
                network_id: network_id, 
                address: address, 
                privateKey: " ", });
           let  val     = await poolWalletItem.save()
            
           return val
           
        }
        catch (error) {
            console.log(error)
            return null
        }
    },

}
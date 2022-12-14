
const Network               = require('../Models/network');
const feedWallets           = require('../Models/feedWallets');
const hotWallets            = require('../Models/hotWallets');
var   mongoose              = require('mongoose');
const poolWallet            = require('../Models/poolWallet');
const clients               = require('../Models/clients');
const merchantstores        = require('../Models/merchantstore');

const Utility               = require('../common/Utility');
const feedWalletController  = require('../controllers/Masters/feedWalletController');
const perferedNetwork = require('../Models/perferedNetwork');
var   crypto                = require("crypto");
const TronWeb               = require('tronweb')
const { generateAccount }   = require('tron-create-address')
const Web3                  = require('web3');
require("dotenv").config()

module.exports =
{
    async create_Network(req, res) {
        try {
            console.log(req.body)
            if (req.body.hotwallet == "" || req.body.hotwallet == undefined) {
                res.json({ status: 400, message: "Please Provide Hot Wallet Address", data: null })
            }
            else if (req.body.cointype == "Token" && (req.body.contractAddress == undefined || req.body.contractAddress == "")) {
                res.json({ status: 200, message: "Please Provide Contract Address of Token", data: null })
            }
            else if (req.body.cointype == "Token" && (req.body.contractABI == undefined || req.body.contractABI == "")) {
                res.json({ status: 200, message: "Please Provide Contract ABI of Token", data: null })
            }
            else {
                const NetworkItem = new Network({
                    id          : mongoose.Types.ObjectId(),
                    network     : req.body.network,
                    libarayType : req.body.libarayType,
                    coin: req.body.coin,
                    nodeUrl: req.body.nodeUrl,
                    apiKey: req.body.apiKey,
                    transcationurl: req.body.transcationurl,
                    latest_block_number: req.body.latest_block_number,
                    processingfee: req.body.processingfee,
                    cointype: req.body.cointype,
                    contractAddress: req.body.contractAddress == undefined ? " " : req.body.contractAddress,
                    contractABI: req.body.contractABI == undefined ? " " : JSON.stringify(req.body.contractABI),
                    transferlimit   : req.body.transferlimit,
                    created_by      : req.headers.authorization,
                    currencyid      : req.body.currencyid,
                    scanurl         : req.body.scanurl,
                    gaspriceurl     : req.body.gaspriceurl,
                    icon            : req.body.icon,
                    kyt_network_id  : req.body.kyt_network_id,
                    fixedfee            : req.body.fixedfee,
                    withdrawfee         : req.body.withdrawfee,
                    withdrawflag        : req.body.withdrawflag,
                    native_currency_id  : req.body.native_currency_id,
                    
                });
                NetworkItem.save().then(async (val) => {

                    const feedWallet = new feedWallets({
                        id: mongoose.Types.ObjectId(),
                        network_id: val.id,
                        address: req.body.feedingaddress,
                        privatekey: req.body.feedingprivatekey,
                        status: 1,
                        created_by: req.body.created_by,
                    });
                    let responnse = await feedWallet.save().then(async (val) => {
                        console.log("feedWallets val", val)
                    }).catch(error => {
                        console.log("feedWallets error", error)
                        // return { status: 400, data: {}, message: error }
                    })

                    const hotWallet = new hotWallets({
                        id: mongoose.Types.ObjectId(),
                        network_id: val.id,
                        address: req.body.hotwallet,
                        status: 1,
                        created_by: req.body.created_by,
                    });
                    hotWallet.save().then(async (val) => {
                        console.log("hotWallet val", val)
                    }).catch(error => {
                        console.log("hotWallet error", error)
                    })

                    res.json({ status: 200, data: val, message: "Data" })
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async update_Network(req, res) {
        try {

            if (req.body.cointype == "Token" && (req.body.contractAddress == undefined || req.body.contractAddress == "")) {
                res.json({ status: 200, message: "Please Provide Contract Address of Token", data: null })
            }
            else if (req.body.cointype == "Token" && (req.body.contractABI == undefined || req.body.contractABI == "")) {
                res.json({ status: 200, message: "Please Provide Contract ABI of Token", data: null })
            }
            else {
                await Network.updateOne({ 'id': req.body.id },
                    {
                        $set:
                        {
                            network: req.body.network,
                            libarayType: req.body.libarayType,
                            coin: req.body.coin,
                            nodeUrl: req.body.nodeUrl,
                            apiKey              : req.body.apiKey,
                            transcationurl      : req.body.transcationurl,
                            latest_block_number : req.body.latest_block_number,
                            processingfee       : req.body.processingfee,
                            cointype            : req.body.cointype,
                            contractAddress     : req.body.contractAddress == undefined ? " " : req.body.contractAddress,
                            contractABI         : req.body.contractABI == undefined ? " " : JSON.stringify(req.body.contractABI),
                            transferlimit       : req.body.transferlimit,
                            created_by          : req.body.created_by,
                            scanurl             : req.body.scanurl,
                            gaspriceurl         : req.body.gaspriceurl,
                            icon                : req.body.icon,
                            currencyid          : req.body.currencyid,
                            kyt_network_id      : req.body.kyt_network_id,
                            native_currency_id  : req.body.native_currency_id,
                            fixedfee            : req.body.fixedfee,
                            withdrawfee         : req.body.withdrawfee,
                            withdrawflag        : req.body.withdrawflag,
                            updated_by          : req.headers.authorization,
                            updated_at          : new Date().toString(),
                      
                        }
                    }).then(async (val) => {
                        if (val != null) {
                            const networkLog = await Network.findOne({ 'id': req.body.id })
                            res.json({ status: 200, message: "Successfully", data: networkLog })
                        }
                        else {
                            res.json({ status: 200, message: "Not Found the Data", data: null })
                        }
                    }).catch(error => {
                        res.json({ status: 400, data: {}, message: error })
                    })

            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async all_network(req, res) {

        try {

            Network.find({
                $or: [{ status: 0 }, { status: 1 }]

            }).then(async (val) => {
                res.json({ status: 200, message: "get", data: val })
            }).
                catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async delete_network(req, res) {
        try {
            await Network.updateOne({ 'id': req.body.id },
                {
                    $set:
                    {
                        status: 2,
                        deleted_by: req.body.deleted_by,
                        deleted_at: Date.now(),

                    }
                }).then(async (val) => {
                    if (val != null) {
                        res.json({ status: 200, message: "Successfully", data: req.body.id })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async change_status_network(req, res) {
        try {
            await Network.updateOne({ 'id': req.body.id },
                {
                    $set:
                    {
                        status: req.body.status,

                    }
                }).then(async (val) => {
                    if (val != null) {
                        const NetworkDetails = await Network.find({ 'id': req.body.id })
                        res.json({ status: 200, message: "Successfully", data: NetworkDetails })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async changeHotWalletStatusLimit(req, res) {
        try {
            await Network.updateOne({ 'id': req.body.id },
                {
                    $set:
                    {
                        hotwallettranscationstatus: req.body.status,

                    }
                }).then(async (val) => {
                    if (val != null) {
                        const NetworkDetails = await Network.find({ 'id': req.body.id })
                        res.json({ status: 200, message: "Successfully", data: NetworkDetails })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async updateprefixandimage(req, res) {
        try {

            await Network.updateOne({ 'id': req.body.id },
                {
                    $set:
                    {
                        icon: req.body.icon,
                    }
                }).then(async (val) => 
                {
                    if (val != null) {
                        const NetworkDetails = await Network.find({ 'id': req.body.id })
                        res.json({ status: 200, message: "Successfully", data: NetworkDetails })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async updatecurrencyid(req, res) {
        try {

            // // simpleImage = req.files.simpleImage;
            // if (!req.files || Object.keys(req.files).length === 0) {
            //     return res.status(400).send('No files were uploaded.');
            // }
            // else{
            //     return res.status(400).send(req.files.simpleImage);
            // }

            await Network.updateOne({ 'id': req.body.id },
                {
                    $set:
                    {
                        currencyid: req.body.currencyid,
                    }
                }).then(async (val) => {
                    if (val != null) {
                        const NetworkDetails = await Network.find({ 'id': req.body.id })
                        res.json({ status: 200, message: "Successfully", data: NetworkDetails })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async updategasimit(req, res) {
        try {
            await Network.updateOne({ 'id': req.body.id },
                {
                    $set:
                    {
                        gaslimit: req.body.gaslimit,
                    }
                }).then(async (val) => {
                    if (val != null) {
                        const NetworkDetails = await Network.find({ 'id': req.body.id })
                        res.json({ status: 200, message: "Successfully", data: NetworkDetails })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async allNetworkForClient(req, res) {
        try {
            Network.find({ 'status': 0 }, { currencyid: 1, id: 1, coin: 1, cointype: 1, libarayType: 1, icon: 1, network: 1 }).then(async (val) => {
                res.json({ status: 200, message: "get", data: val })
            }).
                catch(error => {
                    res.json({ status: 400, data: {}, message: error })
            })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async allNetworkForPOSClient(req, res) {
        try 
        {
            let token = req.headers.authorization;
            let merchantstore  = await merchantstores.findOne({ $and: [{ storeapikey: token }, { status: { $eq: 0 } }] });
          
            let networksDetails = await perferedNetwork.aggregate([
                { $match    :   { clientapikey: merchantstore.clientapikey, status : 1  }},
                { $lookup   :   { from: "networks", localField: "networkid", foreignField: "id", as: "networkDetails" } },
                {
                    "$project":
                    {
                        "networkDetails.id"         : 1, 
                        "networkDetails.currencyid" : 1, 
                        "networkDetails.coin"       : 1, 
                        "networkDetails.cointype"   : 1, 
                        "networkDetails.libarayType": 1, 
                        "networkDetails.icon"       : 1, 
                        "networkDetails.network"    : 1, 
                    }
                }

            ])
            res.json({ status: 200, message: "get", data: networksDetails })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async allPreferedeNetworkForClient(req, res) {
        try {
            let networksDetails = await perferedNetwork.aggregate([
                { $match: { clientapikey: req.headers.authorization, status : 1  }},
                { $lookup: { from: "networks", localField: "networkid", foreignField: "id", as: "networkDetails" } },
                {
                    "$project":
                    {
                        "networkDetails.id"         : 1, 
                        "networkDetails.currencyid" : 1, 
                        "networkDetails.coin"       : 1, 
                        "networkDetails.cointype"   : 1, 
                        "networkDetails.libarayType": 1, 
                        "networkDetails.icon"       : 1, 
                        "networkDetails.network"    : 1, 
                    }
                }
            ])
            res.json({ status: 200, message: "get", data: networksDetails })
        }
        catch (error) {
            console.log("allPreferedeNetworkForClient",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async update_kytnetworkid(req, res) {
        try {
            await Network.findOneAndUpdate({ 'id': req.body.id },
                {
                    kyt_network_id: req.body.kyt_network_id,

                }).then(async (val) => {
                    res.json({ status: 200, message: "get", data: val })
                }).
                catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async update_native_currency_id(req, res) {
        try {
            await Network.findOneAndUpdate({ 'id': req.body.id },
                {
                    native_currency_id  : req.body.native_currency_id,
                },
                { returnDocument: 'after' }
                ).then(async (val) => 
                {
                    res.json({ status: 200, message: "get", data: val })
                }).
                catch(error => 
                    {
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async update_withdrawsettings(req, res) {
        try {
            await Network.findOneAndUpdate({ 'id': req.body.id },
                {
                    withdrawflag    : req.body.withdrawflag,
                    withdrawfee     : req.body.withdrawfee,
                    fixedfee        : req.body.fixedfee,
                },
                { returnDocument: 'after' }
                ).then(async (val) => 
                {
                    res.json({ status: 200, message: "get", data: val })
                }).
                catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    
}
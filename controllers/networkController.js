const Network = require('../Models/network');
var mongoose = require('mongoose');
require("dotenv").config()

module.exports =
{
    async create_Network(req, res) {
        try {

            if (req.body.cointype == "Token" && (req.body.contractAddress == undefined || req.body.contractAddress == "")) {
                res.json({ status: 200, message: "Please Provide Contract Address of Token", data: null })
            }
            else if (req.body.cointype == "Token" && (req.body.contractABI == undefined || req.body.contractABI == "")) {
                res.json({ status: 200, message: "Please Provide Contract ABI of Token", data: null })
            }
            else {
                const NetworkItem = new Network({
                    id: mongoose.Types.ObjectId(),
                    network: req.body.network,
                    coin: req.body.coin,
                    nodeUrl: req.body.nodeUrl,
                    apiKey: req.body.apiKey,
                    transcationurl: req.body.transcationurl,
                    latest_block_number: req.body.latest_block_number,
                    processingfee: req.body.processingfee,
                    cointype: req.body.cointype,
                    contractAddress: req.body.contractAddress == undefined ? " " : req.body.contractAddress,
                    contractABI: req.body.contractABI == undefined ? " " : JSON.stringify(req.body.contractABI),
                    transferlimit: req.body.transferlimit,
                    created_by: req.body.created_by,
                    scanurl: req.body.scanurl,
                    gaspriceurl: req.body.scanurl,
                });
                NetworkItem.save().then(async (val) => {
                    res.json({ status: 200, message: "Successfully", data: val })
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
                            coin: req.body.coin,
                            nodeUrl: req.body.nodeUrl,
                            apiKey: req.body.apiKey,
                            transcationurl: req.body.transcationurl,
                            latest_block_number: req.body.latest_block_number,
                            processingfee: req.body.processingfee,
                            cointype: req.body.cointype,
                            contractAddress: req.body.contractAddress == undefined ? " " : req.body.contractAddress,
                            contractABI: req.body.contractABI == undefined ? " " : JSON.stringify(req.body.contractABI),
                            transferlimit: req.body.transferlimit,
                            created_by: req.body.created_by,
                            scanurl: req.body.scanurl,
                            gaspriceurl: req.body.scanurl,
                        }
                    }).then(async (val) => {
                        if (val != null) 
                        {
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
            Network.find({ 'deleted_by': 0 }).then(async (val) => {
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
                    deleted_by: req.body.deleted_by,
                    deleted_at: Date.now(),
                   
                }
            }).then(async (val) => {
                if (val != null) 
                {
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
                if (val != null) 
                {
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
    
}
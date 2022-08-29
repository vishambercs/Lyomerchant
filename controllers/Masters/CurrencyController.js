const Currencies = require('../../Models/Currency');
const Network = require('../../Models/network');
const Utility = require('../../common/Utility');
const hotWallets = require('../../Models/hotWallets');
var mongoose = require('mongoose');
var crypto = require("crypto");
const TronWeb = require('tronweb')
const { generateAccount } = require('tron-create-address')
const Web3 = require('web3');
require("dotenv").config()
var stringify           = require('json-stringify-safe');
module.exports =
{
    async createCurrency(req, res) {
        try {
           
            const Currency = new Currencies({
                id     : mongoose.Types.ObjectId(),
                title  : req.body.title,
                icon   : req.body.icon,
                name   : req.body.name,
                status : req.body.status,
                remarks: await Utility.checkthevalue(req.body.remarks),
                created_by: req.body.created_by,
            });
            Currency.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
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
    async allCurrency(req, res) {
        try {
            Currencies.find({ 'deleted_by': 0 }).then(async (val) => {
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
    async deleteCurrency(req, res) {
        try {
            await Currencies.findOneAndUpdate({ 'id': req.body.id },
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
    async updateCurrency(req, res) {
        try {
             await Currencies.findOneAndUpdate({ 'id': req.body.id },
                    {
                        $set:
                        {
                            title  : req.body.title,
                            status : req.body.status,
                            icon   : req.body.icon,
                            name   : req.body.name,
                            remarks: await Utility.checkthevalue(req.body.remarks),
                        }
                    }).then(async (val) => {
                        if (val != null) 
                        {
                            const networkLog = await Currencies.findOne({ 'id': req.body.id })
                            res.json({ status: 200, message: "Successfully", data: networkLog })
                        }
                        else 
                        {
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
    async priceConversition(req, res) {
        try 
        {

            let parameters = `ids=${req.body.coinid}&vs_currencies=${req.body.currenid}`
            let COINGECKO_URL   =  process.env.COINGECKO+parameters
            let axiosGetData    =  await Utility.Get_Request_By_Axios(COINGECKO_URL,{},{})
            var stringify_response = JSON.parse(axiosGetData.data)
            res.json({ status: 200, data: stringify_response.data, message: "kasd" })
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}

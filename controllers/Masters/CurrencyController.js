const Currencies                    = require('../../Models/Currency');
const networks                      = require('../../Models/network');
const merchantstores                = require('../../Models/merchantstore');
const perferedNetworks              = require('../../Models/perferedNetwork');
const Utility                       = require('../../common/Utility');
var mongoose                        = require('mongoose');
var crypto                          = require("crypto");
const TronWeb                       = require('tronweb')
const { generateAccount }           = require('tron-create-address')
const Web3 = require('web3');
require("dotenv").config()
var stringify           = require('json-stringify-safe');
module.exports =
{
    async createCurrency(req, res) {
        try {
           
            const Currency = new Currencies({
                id         : mongoose.Types.ObjectId(),
                title      : req.body.title,
                icon       : req.body.icon,
                name       : req.body.name,
                status     : 1,
                remarks    : await Utility.checkthevalue(req.body.remarks),
                created_by : req.body.created_by,
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
            Currencies.find({  }).then(async (val) => {
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
                    'status':0,
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
            console.log(req.body)
             await Currencies.findOneAndUpdate({ 'id': req.body.id },
                    {
                        
                        $set:
                        {
                            title  : req.body.title,
                            icon   : req.body.icon,
                            name   : req.body.name,
                            remarks: await Utility.checkthevalue(req.body.remarks),
                            status : req.body.status
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
            let network             = await networks.findOne({ 'id': req.body.coinid })
            let Currency            = await Currencies.findOne({ 'id': req.body.currenid })
            let parameters          = `ids=${network.currencyid}&vs_currencies=${Currency.title}`
            let COINGECKO_URL       =  process.env.COINGECKO+parameters
            let axiosGetData        =  await Utility.Get_Request_By_Axios(COINGECKO_URL,{},{})
            var stringify_response  = JSON.parse(axiosGetData.data)
            res.json({ status: 200, data: stringify_response.data, message: "Currency API Balance" })
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async priceConversitionChanges(req, res) {
        try 
        {
            let network                     = await networks.findOne({ 'id': req.body.coinid })
            let Currency                    = await Currencies.findOne({ 'id': req.body.currenid })
            let perferedNetwork             = await perferedNetworks.findOne({ networkid: req.body.coinid, clientapikey : req.headers.authorization })
            let pricemargin                 = perferedNetwork != null ? perferedNetwork.pricemargin : 0
            let parameters                  = `ids=${network.currencyid}&vs_currencies=${Currency.title}`
            let COINGECKO_URL               =  process.env.COINGECKO+parameters
            let axiosGetData                =  await Utility.Get_Request_By_Axios(COINGECKO_URL,{},{})
            var stringify_response          = JSON.parse(axiosGetData.data)
            let pricedata                   = stringify_response.data 
            let pricedatacurrency           = pricedata[network.currencyid]
            let pricetitle                  = Currency.title.toLowerCase()
            pricedatacurrency[pricetitle]   = pricedatacurrency[pricetitle] - pricemargin
            pricedata[network.currencyid]   = pricedatacurrency[pricetitle]
            res.json({ status: 200, data: pricedata, message: "Currency API Balance" })
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async priceConversitionPosChanges(req, res) {
        try 
        {
            let token                       = req.headers.authorization;
            let merchantstore               = await merchantstores.findOne({ $and: [{ storeapikey: token }, { status: { $eq: 0 } }] });
            let network                     = await networks.findOne({ 'id': req.body.coinid })
            let Currency                    = await Currencies.findOne({ 'id': req.body.currenid })
            let perferedNetwork             = await perferedNetworks.findOne({ networkid: req.body.coinid, clientapikey : merchantstore.clientapikey })
            let pricemargin                 = perferedNetwork != null ? perferedNetwork.pricemargin : 0
            let parameters                  = `ids=${network.currencyid}&vs_currencies=${Currency.title}`
            let COINGECKO_URL               =  process.env.COINGECKO+parameters
            let axiosGetData                =  await Utility.Get_Request_By_Axios(COINGECKO_URL,{},{})
            var stringify_response          = JSON.parse(axiosGetData.data)
            let pricedata                   = stringify_response.data 
            let pricedatacurrency           = pricedata[network.currencyid]
            let pricetitle                  = Currency.title.toLowerCase()
            pricedatacurrency[pricetitle]   = pricedatacurrency[pricetitle] - pricemargin
            pricedata[network.currencyid]   = pricedatacurrency[pricetitle]
            res.json({ status: 200, data: pricedata, message: "Currency API Balance" })
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}


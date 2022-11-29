const Currencies                    = require('../../Models/Currency');
const networks                      = require('../../Models/network');
const merchantstores                = require('../../Models/merchantstore');
const perferedNetworks              = require('../../Models/perferedNetwork');
const Utility                       = require('../../common/Utility');
var mongoose                        = require('mongoose');
var crypto                          = require("crypto");
var axios                          = require("axios");
const TronWeb                       = require('tronweb')
const { generateAccount }           = require('tron-create-address')
const Web3 = require('web3');
require("dotenv").config()
var stringify           = require('json-stringify-safe');

const getCoinPrice = async (coin) => {
    if (["LYO", "LYO1"].includes(coin)) {
        try {
            const getBalanceRes = await axios.get(`https://openapi.lyotrade.com/sapi/v1/klines?symbol=LYO1USDT&interval=1min&limit=1`);
            return getBalanceRes.data[0]['close'];
         } catch(e) {
            console.log(e);
            return 1;
         }
    } else {
        try {
           const getBalanceRes = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${coin}USDT&interval=1m&limit=1`);
           return getBalanceRes.data[0][4];
        } catch(e) {
           console.log(e);
           return 1;
        }
    }
}
const getFiatRates = async (coin) => {
    try {
       const getBalanceRes = await axios.get(`https://www.binance.com/bapi/asset/v1/public/asset-service/product/currency`);
       const rate = await getBalanceRes.data.data.find(element => element.pair.includes(coin)).rate;
       return rate;
    } catch(e) {
       console.log(e);
       return 1;
    }
}
const getRate = async (crypto, fiat) => {
    if (crypto === 'USDT') {
        const fiatRate = await getFiatRates(fiat);
        return (parseFloat(1)*parseFloat(fiatRate)).toFixed(4);
    } else {
        const getCryptoToUsdt = await getCoinPrice(crypto);
        const fiatRate = await getFiatRates(fiat);
        return (parseFloat(getCryptoToUsdt)*parseFloat(fiatRate)).toFixed(4);
    }
}




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

            let getRatedata         = await getRate(network.coin, Currency.title);
           


            res.json({ status: 200, data: getRatedata, message: "Currency API Balance" })
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
            let networktitle                = network.currencyid.toLowerCase()
            let Currency                    = await Currencies.findOne({ 'id': req.body.currenid })
            let perferedNetwork             = await perferedNetworks.findOne({ networkid: req.body.coinid, clientapikey : req.headers.authorization })
            if(perferedNetwork == null){
                res.json({ status: 400, data: {}, message: "Error" })
            }
           
            let pricemargin                 = perferedNetwork != null ? perferedNetwork.pricemargin : 0
            let parameters                  = `ids=${network.currencyid}&vs_currencies=${Currency.title}`
            let COINGECKO_URL               =  process.env.COINGECKO+parameters
            let axiosGetData                =  await Utility.Get_Request_By_Axios(COINGECKO_URL,{},{})
            var stringify_response          = JSON.parse(axiosGetData.data)
            let pricedata                   = stringify_response.data 
            let pricedatacurrency           = pricedata[networktitle]
            let pricetitle                  = Currency.title.toLowerCase()
            // pricedatacurrency[pricetitle]   = network.stablecoin == true ? ( 1 - pricemargin) : pricedatacurrency[pricetitle] - pricemargin
            let getRatedata                 = await getRate(network.coin, Currency.title);
            pricedatacurrency[pricetitle]   = getRatedata - pricemargin
            pricedata[networktitle]         = pricedatacurrency[pricetitle]
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
            let networktitle                = network.currencyid.toLowerCase()
            let pricedatacurrency           = pricedata[networktitle]
            let pricetitle                  = Currency.title.toLowerCase()
            // pricedatacurrency[pricetitle]   = network.stablecoin == true ? ( 1 - pricemargin) : pricedatacurrency[pricetitle] - pricemargin
            let getRatedata                 = await getRate(network.coin, Currency.title);
            pricedatacurrency[pricetitle]   = getRatedata - pricemargin
            pricedata[networktitle]         = pricedatacurrency[pricetitle]
            res.json({ status: 200, data: pricedata, message: "Currency API Balance" })
        }
        catch (error) 
        {
            console.log("priceConversitionPosChanges",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async priceConversitionChangesforpaymentlink(networkid,currenid,apikey) {
        try 
        {
            let network                     = await networks.findOne({ 'id': networkid })
            let networktitle                = network.currencyid.toLowerCase()
            let Currency                    = await Currencies.findOne({ 'title': currenid })
            let perferedNetwork             = await perferedNetworks.findOne({ networkid: networkid, clientapikey : apikey })
            if(perferedNetwork == null){
                return 0  
            }
            // if(perferedNetwork != null && network.stablecoin == true){
            //     return 1  
            // }
            let pricemargin                 = perferedNetwork != null ? perferedNetwork.pricemargin : 0
            let parameters                  = `ids=${network.currencyid}&vs_currencies=${Currency.title}`
            let COINGECKO_URL               = process.env.COINGECKO+parameters
            let axiosGetData                = await Utility.Get_Request_By_Axios(COINGECKO_URL,{},{})
            var stringify_response          = JSON.parse(axiosGetData.data)
            let pricedata                   = stringify_response.data 
            let pricedatacurrency           = pricedata[networktitle]
            let pricetitle                  = Currency.title.toLowerCase()
            // pricedatacurrency[pricetitle]   = network.stablecoin == true ? ( 1 - pricemargin) : pricedatacurrency[pricetitle] - pricemargin
            // pricedatacurrency[pricetitle]   =  pricedatacurrency[pricetitle] - pricemargin
            pricedatacurrency[pricetitle]   = getRatedata - pricemargin
            pricedata[networktitle]         = pricedatacurrency[pricetitle]
            return  pricedatacurrency[pricetitle]
            // return { status: 200, data: pricedata, message: "Currency API Balance" }
        }
        catch (error) 
        {
            console.log("priceConversitionChangesforpaymentlink",error)
            return 0
            // return { status: 400, data: {}, message: "Error" }
        }
    },
}


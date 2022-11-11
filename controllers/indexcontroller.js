const poolWallets    = require('../Models/poolWallet');
const topups         = require('../Models/topup');
const networks       = require('../Models/network');
const axios          = require('axios')
async function pricecalculation(networktitle,balance) {
    try {
        
        
        let parameters       = `ids=${networks.currencyid}&vs_currencies=usd`
        let COINGECKO_URL    = process.env.COINGECKO + parameters
        response             = {}
        await axios.get(COINGECKO_URL, { params: {},headers: {}}).then(res => {
            var stringify_response = stringify(res)
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        }).catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
        var stringify_response = JSON.parse(response.data)
        let pricedata = stringify_response.data
        let pricedatacurrency           = pricedata[networktitle]
        let price                       = parseFloat(pricedatacurrency["usd"]) * parseFloat(balance)
        return price;
    }
    catch (error) {
        console.log("pricecalculation", error)
        return 0;

    }
}
module.exports =
{

    async updateTopTranscationPoolWallet(req, res) 
    {
        try 
        {
            let balance     = +(req.body.balance)
            let status      =  req.body.status
            let poolWallet  = await poolWallets.findOne({ 'address': req.body.address,status:1 })
            if(poolWallet   ==  null)
            {
               return res.json({ status: 400, data: {}, message: "Invalid Request" })
            }
            let topup = await topups.findOne({ poolwalletID: poolWallet.id, status: 0 })
            if(topup ==  null)
            {
               return res.json({ status: 400, data: {}, message: "Invalid Request" })
            }
            let network             = await networks.findOne({ id: poolWallet.network_id })
            let networktitle        = network.currencyid.toLowerCase()
            let price               = await pricecalculation(networktitle,balance) 
            let updatetopup         = await topups.updateOne({ id: topup.id}, { $set:{
                amount              : balance,
                fiat_amount         : price, 
                status              : status,
                api_updated_at      : new Date().toString()
            }},{'returnDocument'    : 'after'})

            let updatepoolwallet  = await poolWallets.updateOne({ 'id': poolWallet.id,status:20 })
            res.json({ status: 200, data: {}, message: "Thanks I am updating" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    

}
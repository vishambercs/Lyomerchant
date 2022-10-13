const paymentLinkTransactionPool = require('../../Models/paymentLinkTransactionPool');
const posTransactionPool = require('../../Models/posTransactionPool');
const network = require('../../Models/network');
const poolWallets = require('../../Models/poolWallet');
const transactionPool = require('../../Models/transactionPool');
const payLink = require('../../Models/payLink');
const invoice = require('../../Models/invoice');
const Constant = require('../../common/Constant');
const { getBalance } = require('bitcoin-core/src/methods');
const Web3 = require('web3');
require("dotenv").config()



module.exports =
{

    async getTransStatus(req, res) {
        try {
            let id = req.body.transid;
            let pyTranPool = await paymentLinkTransactionPool.findOne({ "id": id, "api_key": req.headers.authorization })
            let posTranPool = await posTransactionPool.findOne({ "id": id, "api_key": req.headers.authorization })
            let TranPool = await transactionPool.findOne({ "id": id, "api_key": req.headers.authorization })
            
            let poolwallet = pyTranPool != null ? await poolWallets.findOne({ id: pyTranPool.poolwalletID }) : null
            poolwallet = (poolwallet == null && posTranPool != null) ? await poolWallets.findOne({ id: posTranPool.poolwalletID }) : poolwallet
            poolwallet = (poolwallet == null && TranPool != null) ? await poolWallets.findOne({ id: TranPool.poolwalletID }) : poolwallet

            let payLink_data = pyTranPool != null ? await payLink.findOne({ id: pyTranPool.payLinkId}) : null
            let invoice_data = payLink_data != null ? await invoice.findOne({ id: payLink_data.invoice_id}) : null

            let networkDetails = poolwallet != null ? await network.findOne({ id: poolwallet.network_id}) : null
            let status = pyTranPool != null ? Constant.transstatus.filter(index => index.id == pyTranPool.status) : []
            status = (status.length > 0 && posTranPool != null) ? Constant.transstatus.filter(index => index.id == posTranPool.status) : status
            status = (status.length > 0 && TranPool != null) ? Constant.transstatus.filter(index => index.id == TranPool.status) : status
            
            
            let amount = pyTranPool != null                   ? pyTranPool.amount : 0
            amount     = (amount == 0 && posTranPool != null) ?  posTranPool.amount : amount
            amount     = (amount == 0 && TranPool != null)    ? TranPool.amount : amount
            
            let currency = pyTranPool != null                   ? pyTranPool.currency : 0
            currency     = (amount == 0 && posTranPool != null) ?  posTranPool.currency : currency
            currency     = (amount == 0 && TranPool != null)    ? TranPool.currency : currency

            
            // let invoiceNumber = pyTranPool != null ? pyTranPool.invoiceNumber : ""

            let datarray = 
            {
                "transaction_status"    : (status.length > 0 ? status[0].title : ""),
                "transaction_id"        : req.body.transid,
                "address"               : (poolwallet != null ? poolwallet.address : ""),
                "coin"                  : (networkDetails != null ? networkDetails.coin : ""),
                "network"               : (networkDetails != null ? networkDetails.network : ""),
                "crypto_amount"         :  amount,
                "invoicenumber"         :  (invoice_data != null ) ? invoice_data.invoiceNumber : "" ,
                "fiat_amount"           :  (invoice_data != null ) ? invoice_data.totalAmount : "" ,
                "currency"              : currency   
                
            }

            res.json(
                {
                    status: 200,
                    data: datarray,
                    "message": (status.length > 0 ? "" : "transaction Not Found")
                })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },

    async getBalance(req, res) {
        try {
            const WEB3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"))
            const contract = new WEB3.eth.Contract(Constant.USDT_ABI, "0xF5EB513a31af1Af797E3514a713cCc11492FB2df");
            let token_balance = await contract.methods.balanceOf(req.body.address.toLowerCase()).call();
            let native_balance = await WEB3.eth.getBalance(req.body.address.toLowerCase())
           
            res.json(
                {
                    status: 200,
                    token_balance: token_balance,
                    native_balance: native_balance
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
}
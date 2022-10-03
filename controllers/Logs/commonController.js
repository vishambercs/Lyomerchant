const paymentLinkTransactionPool     = require('../../Models/paymentLinkTransactionPool');
const posTransactionPool             = require('../../Models/posTransactionPool');
const transactionPool                = require('../../Models/transactionPool');
const Constant                = require('../../common/Constant');
require("dotenv").config()



module.exports =
{

    async getTransStatus(req, res) {
        try {
            let id          = req.body.transid;
            let pyTranPool  = await paymentLinkTransactionPool.findOne({"id":id , "api_key" : req.headers.authorization})
            let posTranPool = await posTransactionPool.findOne({"id":id, "api_key" : req.headers.authorization})
            let TranPool    = await transactionPool.findOne({"id":id, "api_key" : req.headers.authorization})
            let status      = pyTranPool != null ? Constant.transstatus.filter(index => index.id == pyTranPool.status) : []
            status          = (status == "" && posTranPool != null) ? Constant.transstatus.filter(index => index.id == posTranPool.status) : status
            status          = (status == "" && TranPool != null) ? Constant.transstatus.filter(index => index.id == TranPool.status) : status
            
            let datarray = {"transaction_status" : (status.length > 0 ? status[0].title : "") , "transaction_id": req.body.transid ,   }
            
            
            res.json(
                { status: 200, 
                  data:datarray, 
                 "message" :( status.length > 0 ? "" : "transaction Not Found") })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
}
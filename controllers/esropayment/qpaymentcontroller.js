const   quickpayments            = require('../../Models/quickpayment');
const   poolWallet               = require('../../Models/poolWallet');
var     otpGenerator             = require('otp-generator')
var     mongoose                 = require('mongoose');
var     poolwalletController     = require('../poolwalletController');
module.exports =
{
    async create_quick_payment(req, res) 
    {
        try {
            var merchantKey     = req.headers.authorization
            var type            = req.body.type
            var code            = otpGenerator.generate(6, { digits: true ,specialChars :false,lowerCaseAlphabets :false,upperCaseAlphabets :false,});
            const quickpayment = new quickpayments({
                id              : mongoose.Types.ObjectId(),
                type            : type,
                api_key         : merchantKey,
                code            : code,
                status          : 0,
                timestamps      : new Date().getTime(),
                created_at      : new Date().toString()
            });
            quickpayment.save().then(async (val) => 
            {
                res.json({ status: 200, message: "Saved Quick Paymenmts", data: { id : val.id, type :val.type , code :val.code } })
            }).catch(error => {
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async verifyTheCode(req, res) 
    {
        try {
            var code            = req.body.code
            quickpayments.findOne({ code : code }).then(async (val) => 
            {
                if( val != null )
                {
                    return res.json({ status: 200, message: "Get The Quick Payments Data", data: { id : val.id, type :val.type , code :val.code } })
                }
                else
                {
                    return res.json({ status: 200, message: "Not Found", data: null })
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
    async updateQuickpayment(req, res) 
    {
        try {

            var quickpaymentid      = req.body.quickpaymentid
            var networkType         = req.body.networkid
            var totalamount         = req.body.totalamount
            var qty                 = req.body.qty
            let account             = await poolwalletController.getPoolWalletID(networkType) 

            await quickpayments.findOneAndUpdate({ id : quickpaymentid }, {$set: { poolwalletID : account.id,totalamount  : totalamount, qty : qty, }}, {returnDocument : 'after'}).then(async (val) => 
                {
                if( val != null )
                {
                    await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                    let data = { transactionID: val.id, address: account.address }
                    return res.json({ status: 200, message: "Assigned Merchant Wallet Successfully", data: data })
                }
                else
                {
                    return res.json({ status: 200, message: "Not Found", data: null })
                }
                }).catch(error => 
                    {
                console.log("error",error)        
                res.json({ status: 400, data: {}, message: "error" })
               })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}




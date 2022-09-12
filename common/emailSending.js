
const ejs = require('ejs');
const fs = require('fs');
const Web3 = require('web3');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const transcationLog = require('../Models/transcationLog');
const network = require('../Models/network');
var qs = require('qs');
const Constant = require('./Constant');
const Utility = require('./Utility');
const clientWallets = require('../Models/clientWallets');
const poolWallets = require('../Models/poolWallet');
const transactionPools = require('../Models/transactionPool');
const clients = require('../Models/clients');
const hotWallets = require('../Models/hotWallets');
const hot_wallet_trans_logs = require('../Models/hot_wallet_trans_logs');
require("dotenv").config()
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const TronWeb = require('tronweb')
const posTransactionPool = require('../Models/posTransactionPool');
const transporter = nodemailer.createTransport({ host: "srv.lyotechlabs.com", port: 465, auth: { user: "no-reply@email.lyomerchant.com", pass: "1gbA=0pVVJcS", } });
const transUtility = require('./transUtilityFunction');

async function sendEmailFunc(paramters) {
    try {
        let respone = {}
        let views = "./views/emailtemplate/" + paramters.emailTemplateName
        let info = transporter.sendMail
            ({
                from: process.env.FROM,
                to: paramters.to,
                subject: paramters.subject,
                html: ejs.render(fs.readFileSync(views, 'utf-8'), { "data": paramters.templateData }),
            },
                function (error, info) {
                    if (error) {
                        console.log("Message error", error);
                        respone = { status: 400, data: info, message: error }
                    } else {
                        console.log("Message %s sent: %s", info.messageId, info);
                        respone = { status: 200, data: info, message: "Get The Data" }
                    }
                });
        return JSON.stringify(respone)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        respone = { status: 400, data: {}, message: error.message }
        return JSON.stringify(respone)
    }
}
module.exports =
{
    sendEmailFunc :sendEmailFunc,
}    
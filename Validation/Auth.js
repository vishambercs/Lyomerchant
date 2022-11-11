const client = require('../Models/clients');
const admins = require('../Models/admin');
const merchantstores = require('../Models/merchantstore');
const merchantcategory = require('../Models/merchantcategory');
const storeDevices = require('../Models/storeDevices');
const paymentLinkTransactionPool = require('../Models/paymentLinkTransactionPool');
const payLink = require('../Models/payLink');
const invoice = require('../Models/invoice');
const Validator = require('./index');
const jwt = require('jsonwebtoken');
const fastPaymentCode = require('../Models/fastPaymentCode');
const merchantstore = require('../Models/merchantstore');
const clients = require('../Models/clients');

require("dotenv").config()
module.exports =
{


    async Verfiy_Merchant(req, res, next) {
        try {
            let api_key = req.headers.authorization;
            if (api_key == "UPd34b73f4ab3ba08fae12e39c4660f746dad5dbe7TOP"){
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },



}



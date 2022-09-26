const categories = require('../../Models/category');
const transcationLog = require('../../Models/transcationLog');
const cornJobs = require('../../common/cornJobs');
var CryptoJS = require('crypto-js')
var crypto = require("crypto");
var Utility = require('../../common/Utility');
var constant = require('../../common/Constant');
var commonFunction = require('../../common/commonFunction');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const clientWallets = require('../../Models/clientWallets');
const poolWallet = require('../../Models/poolWallet');
const transactionPools = require('../../Models/transactionPool');
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const network = require('../../Models/network');
const clientapi = require('../../Models/clientapi');
var mongoose = require('mongoose');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const Constant = require('../../common/Constant');
var otpGenerator = require('otp-generator')
require("dotenv").config()

module.exports =
{
    async getapikey(req, res) {
        try 
        {
          let   data  = await clientapi.findOne({client_api : req.headers.authorization})
          let status = data == null ? false : true 
          res.json({ status: 200, data: status, message: "Sucess" })
        }
        catch (error) 
        {
            res.json({ status: 400, data: {}, message: "Email or Password is wrong" })
        }
    },
}
const Apitoken = require('../../Models/Apitoken');
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
var mongoose = require('mongoose');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const Constant = require('../../common/Constant');
var otpGenerator = require('otp-generator')
require("dotenv").config()
const jwt = require('jsonwebtoken');
module.exports =
{
    
    async save_api_token(req, res) {
        try {
          let api_token =  await Apitoken.updateMany({api_key :  req.headers.authorization } , {$set : { status : 0 }})
          var jwt_token = jwt.sign({ id: req.headers.authorization }, process.env.AUTH_KEY);
          let new_api_token =  await Apitoken.insertMany(
            [{ 
                api_key :  req.headers.authorization, 
                token   : jwt_token, 
                status  : 1 
            }])
          res.json({ status: 200, data: jwt_token, message: "Token" })
        }
        catch (error) 
        {
            console.log("save_api_token",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

   
    
}
const clients = require('../Models/clients');
const transactions = require('../Models/WalletAddress');
const transactionPool = require('../Models/transactionPool');
const transcationLog = require('../Models/transcationLog');
const poolWallet = require('../Models/poolWallet');
const cornJobs = require('../common/cornJobs');
var CryptoJS = require('crypto-js')
var crypto = require("crypto");
var Utility = require('../common/Utility');
const bcrypt = require('bcrypt');
require("dotenv").config()
const Web3 = require('web3');

module.exports =
{

    async get_transcation_balance_according_to_status(req, res) {
        try {
          
            poolWallet.aggregate(
                [
                    {
                        $group: {
                            _id: '$network_id',
                            total: { $sum: '$balance' },
                        },
                    },
                ]).then(val => {
                    res.json({ status: 200, message: "Clients Data", data: val })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    // res.json({ "error": error })
                    res.json({ status: 400, data: {}, message: error })
                })
                
           
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },


}
const clients = require('../Models/clients');

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
    async get_address_for_checking(addressObject, index) {
        try {
            let pooladdress = await poolWallet.find({ status: false })
            return pooladdress
        }
        catch (error) { return null }
    },

    async get_all_transcation_with_logs(req, res) {
        try {
            poolWallet.aggregate([{
                $lookup: {
                    from: "transcationlogs", // collection to join
                    localField: "address",//field from the input documents
                    foreignField: "to",//field from the documents of the "from" collection
                    as: "transcation"// output array field
                }
            },
            ]).then(async (data) => {

                res.json({ status: 200, message: "Pool Address", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: error })


        }
    },
    async get_all_transcation_with_user_address(req, res) {
        try {
            poolWallet.aggregate([
                { "$match" : { "api_key" : req.headers.authorization }},
                
                {
                $lookup: {
                    from: "transcationlogs", // collection to join
                    localField: "address",//field from the input documents
                    foreignField: "to",//field from the documents of the "from" collection
                    as: "transcation"// output array field
                }
            },
            ]).then(async (data) => {

                res.json({ status: 200, message: "Pool Address", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: error })


        }
    },
    async Client_Balance(req, res) {
        try {
            
            poolWallet.aggregate(
                
                [
                    { $match: { status : true }},
                    {
                        $group: {
                            _id: '$network',
                            total: { $sum: '$amount' },
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
    async get_transcation_balance_according_to_status(req, res) {
        try {
            poolWallet.aggregate(
                [
                    { $group: { _id: '$network_id', total: { $sum: '$balance' }} },
                    {$lookup: {from: "networks", localField: "_id",foreignField: "id",as: "networkDetails"}},
                ]).then(val => {
                    res.json({ status: 200, message: "Clients Data", data: val })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
}
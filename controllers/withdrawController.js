const withdrawLogs  = require('../Models/withdrawLog');
const cornJobs      = require('../common/cornJobs');
const networks      = require('../Models/network');
var CryptoJS        = require('crypto-js')
var crypto          = require("crypto");
var Utility         = require('../common/Utility');
const bcrypt        = require('bcrypt');
const Web3          = require('web3');
var crypto          = require("crypto");
const clientWallets = require('../Models/clientWallets');


require("dotenv").config()

module.exports =
{
    async save_withdraw(req, res) 
    {
        try 
        {
            const network        = await networks.findOne({id:req.body.network_id})
            const withdrawLog    = await withdrawLogs.findOne({api_key:req.headers.authorization,network_id : req.body.network_id ,status : 0  })
            const clientWallet   = await clientWallets.findOne({client_api_key:req.headers.authorization,network_id:req.body.network_id})
            console.log(network," ",withdrawLog," ",clientWallet)
            console.log("network        =======================",     network)
            console.log("withdrawLog    =======================", withdrawLog)
            console.log("clientWallet   =======================",clientWallet)
            if(withdrawLog != null)
            {
                res.json({ status: 200, data: {}, message: "You have already a request in pending" }) 
            }
            else if(req.body.amount > clientWallet.balance)
            {
                res.json({ status: 200, data: {}, message: "Invalid Amount" }) 
            }
            else if(network != null )
            {
            let transfer_fee  = ((parseFloat(req.body.amount)/10000) + network.processingfee) * 0.03
            const withdrawLog = new withdrawLogs({ 
                id                : crypto.randomBytes(20).toString('hex'),
                api_key           : req.headers.authorization, 
                network_id        : req.body.network_id, 
                amount            : req.body.amount, 
                fee               : transfer_fee,
                address_to        : req.body.address_to,
                address_from      : " ",
                transcation_hash  : " ",
                status            : 0  
            });
            withdrawLog.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
            }).catch(
                error => { res.json({ status: 400, data: {}, message: error }) 
            })
        }
        else
        {
            res.json({ status: 400, data: {}, message: "Unsupported Network " }) 
        }
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async update_withdraw_request(req, res) {
        try {
            await withdrawLogs.findOneAndUpdate(
                {id : req.body.id } , 
                { $set: 
                { 
                    remarks             : req.body.remarks,
                    status              : req.body.status, 
                    address_from        : req.body.address_from, 
                    transcation_hash    : req.body.transcation_hash 
                }}, { $new:true } ).then(async (withdraw) => 
            {
                if(req.body.status == 1)
                {
                let val                                         = await clientWallets.findOne({ api_key: withdraw.api_key, network_id:  withdraw.network_id })
                let clientWallet                                = await clientWallets.updateOne({ api_key: withdraw.api_key, network_id: withdraw.network_id  } ,{ $set: { balance: (val.balance - withdraw.amount ) } } )
               
            }
            let withdrawLog                                 = await withdrawLogs.findOne({id : req.body.id})
            res.json({ status: 200, message: "Successfully", data: withdrawLog })
                
            }).catch(
                error => { res.json({ status: 400, data: {}, message: error }) 
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_client_wihdraw(req, res) {
        try {
            await withdrawLogs.aggregate( 
                [
                    { $match: { api_key: req.headers.authorization } },
                    {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project": {
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
           
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_client_wihdraw_total(req, res) {
        try {
            await withdrawLogs.aggregate( 
                [
                    {  $group: { _id: '$network_id', total: { $sum: '$amount' }} },
                     { $lookup: {from: "networks", localField: "_id",foreignField: "id",as: "networkDetails"}},
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
           
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_admin_wihdraw(req, res) {
        try {
            if (req.body.status != "" && req.body.status != undefined) {
            await withdrawLogs.aggregate( 
                [
                    { $match: { status: parseInt(req.body.status) } },
                    {
                        $skip: parseInt(req.body.offest)
                    },
                    {
                        $limit: parseInt(req.body.limit)
                    },

                    {
                        $lookup:
                        {
                            from: "clients", // collection to join
                            localField: "api_key",//field from the input documents
                            foreignField: "api_key",//field from the documents of the "from" collection
                            as: "clientsDetails"// output array field
                        }
                    },
                    {
                        $lookup: 
                        {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project": {
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
            }
            else{
                await withdrawLogs.aggregate( 
                    [
                        {
                            $skip: parseInt(req.body.offest)
                        },
                        {
                            $limit: parseInt(req.body.limit)
                        },
                        {
                            $lookup:
                            {
                                from: "clients", // collection to join
                                localField: "api_key",//field from the input documents
                                foreignField: "api_key",//field from the documents of the "from" collection
                                as: "clientsDetails"// output array field
                            }
                        },
                        {
                            $lookup: {
                                from: "networks", // collection to join
                                localField: "network_id",//field from the input documents
                                foreignField: "id",//field from the documents of the "from" collection
                                as: "networkDetails"// output array field
                            }
                        },
                        {
                            "$project": {
                                "networkDetails.__v": 0,
                                "networkDetails.id": 0,
                                "networkDetails.nodeUrl": 0,
                                "networkDetails.created_by": 0,
                                "networkDetails.createdAt": 0,
                                "networkDetails.updatedAt": 0,
                                "networkDetails._id": 0
                            }
                        }
                    ]).then(async (data) => {
                        res.json({ status: 200, message: "Withdraw Pool", data: data })
                    }).catch(error => {
                        console.log("get_clients_data", error)
                        res.json({ status: 400, data: {}, message: error })
                    }) 
            }
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_admin_wihdraw_with_Network_ID(req, res) {
        try {
            await withdrawLogs.aggregate( 
                [
                    { $match: { "network_id": req.body.networkid } },
                    {
                        $lookup:
                        {
                            from: "clients", // collection to join
                            localField: "api_key",//field from the input documents
                            foreignField: "api_key",//field from the documents of the "from" collection
                            as: "clientsDetails"// output array field
                        }
                    },
                    {
                        $lookup: 
                        {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                   
                    {
                        "$project": {
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => 
                {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
            
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_client_withdraw_with_network_id(req, res) {
        try {
            await withdrawLogs.aggregate( 
                [
                    { $match: { api_key: req.headers.authorization, network_id: req.body.networkid } },
                    {
                        $lookup: 
                        {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project": {
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
           
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async merchantBalance (req,res){
        try{
            let result = await clientWallets.findOne(req.body.id)
            console.log(result)
            res.json({ status: 200, data: result.balance, message: "clientBalance" })
        }
        catch (error){ console.log(error)}
        
    },
    async withdrawBalance (req,res){
        let data = 100
        let amount = req.body.amount
        try{
            let result = await clientWallets.findOne(req.body.id)
            if (result.balance >= amount){
                if (amount >= data){
                    let result = await withdrawAmountTowallet(req.body.networkId,req.body.amount,req.body.fromWallwt,req.body.toWallet);
                    res.json({ status: 200, data: result.balance, message: "withdrawBalance" })
                }
            
            else res.json({status : 400, data : result.balance,message: "Amount shoud be greater than minimum Withdrawal limit" })
            }
            else  res.json({ status: 200, data: result.balance, message: "Amount shoud be less than or equal to balance" })
            
        }
        catch (error){
            console.log(error)
            res.json({status:400,data:'null',mewssage:"Some error happened"})
        }
        
    },
    async getMinimumWithdraw (req,res){
        let data = 100
        res.json({ status: 400, data: 100, message: "getMinimumWithdraw" })
    },
    async updateMinimumWitdhraw (req,res){
        res.json({ status: 400, data: {}, message: "updateMinimumWitdhraw" })
    },

    
}





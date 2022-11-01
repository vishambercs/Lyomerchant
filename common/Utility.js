var nodemailer          = require('nodemailer');
const ejs               = require('ejs');
const fs                = require('fs');
const Web3              = require('web3');
const axios             = require('axios')
var stringify           = require('json-stringify-safe');
var cornJobs            = require('./cornJobs');
const transcationLog    = require('../Models/transcationLog');
const transactionPools  = require('../Models/transactionPool');
const clients           = require('../Models/clients');
var clientsController   = require('../controllers/clientsController');
const { constant }      = require('./Constant');
var crypto              = require("crypto");
const jwt               = require('jsonwebtoken');
const url               = require('url')
const querystring       = require('querystring');
const Constant          = require('./Constant');
const commonFunction    = require('./commonFunction');
const { generateAccount } = require('tron-create-address')
require("dotenv").config()

const transporter       = nodemailer.createTransport({ host: process.env.HOST, port: process.env.PORT, auth: { user: process.env.USER, pass: process.env.PASS, }});
var CryptoJS            = require('crypto-js')
module.exports =
{
    async generateKey() {
       let key =  await crypto.randomBytes(20).toString('hex')
       return key ;
    },
    async checkthevalue(title) {
        let key =  (title == "" || title == undefined) ? " " : title
        return key ;
     },

    async Get_JWT_Token(userid,expiretime='1h') 
    {
        var token = jwt.sign({ id: userid }, process.env.AUTH_KEY, { expiresIn: expiretime });
        return token ;
    }, 
    Send_Email_Function(parameters) {
        // try {
        //     let respone = {} 
        //     let views = "./views/emailtemplate/" + data.emailTemplateName
        //     let info = transporter.sendMail
        //         ({
        //             from: process.env.FROM,
        //             to: data.to,
        //             subject: data.subject,
        //             html: ejs.render(fs.readFileSync(views, 'utf-8'), { "data": data.templateData }),
        //         },
        //             function (error, info) {
        //                 if (error) {
        //                     console.log("Message error", error);
        //                     respone = { status: 400, data: info, message: error }
        //                 } else {
        //                     console.log("Message %s sent: %s", info.messageId, info);
        //                     respone = { status: 200, data: info, message: "Get The Data" }
        //                 }
        //             });
          
        // }
        // catch (error) {
        //     respone = { status: 400, data: {}, message: error.message }
        // }
        respone = { status: 400, data: {}, message: "" }
        return JSON.stringify(respone)

    },
    Get_New_Address() {
        try {
            var web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_LOCAL_RPC));
            var account = web3.eth.accounts.create();
            return account
        }
        catch (error) {
            console.log("error", error);
            return null
        }
    },
    GetAddress(nodeurl) 
    {
        try 
        {
            if(nodeurl == "tronweb")
            {
                const { address, privateKey }       = generateAccount()
                var account = { "address":address,   "privateKey":privateKey}
                return account
            }
            else{
                var web3 = new Web3(new Web3.providers.HttpProvider(nodeurl));
                var account = web3.eth.accounts.create();
                return account
            }
          
        }
        catch (error) {
            console.log("error", error);
            return null
        }
    },
    async Get_Request_By_Axios(URL, parameters, headers) {
        response = {}
        await axios.get(URL, {
            params: parameters,
            headers: headers
        }).then(res => {
            var stringify_response = stringify(res)
            response = { status: 200, data: stringify_response, message: "Get The Data From URL" }
        })
            .catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
            })
        return response;
    },
    async get_Pending_Transcation() {
        try {
            let pooldata = await transactionPools.aggregate(
                [
                    { $match: { $or: [{ status: 0 }, { status: 2 }] } },
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolWallet"// output array field
                        },
                    }, {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "poolWallet.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project":
                        {
                            "poolWallet.privateKey": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,
                            "poolWallet.__v": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ])
            return pooldata
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
    async receiveMessage(request) {
        try {
            let uniqueKey      =  crypto.randomBytes(20).toString('hex')
            let url_paremeters = url.parse(request.httpRequest.url);
            let queryvariable  = querystring.parse(url_paremeters.query)
            console.log("getTranscationData =====================================",queryvariable);
            var hash           = CryptoJS.MD5(queryvariable.transkey + queryvariable.apikey +  process.env.BASE_WORD_FOR_HASH)
            let getTranscationData = await commonFunction.get_Transcation_Data(queryvariable.transkey)
            console.log("getTranscationData =====================================",getTranscationData);
            if(getTranscationData.length > 0)
            {
            const connection = request.accept(null, request.origin);
            var index = Constant.translists.findIndex(translist => translist.transkey == queryvariable.transkey)
            if(index == -1)
            {
            let client_object = {  "uniqueKey": uniqueKey,  "connection": connection,  "transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}
            Constant.translists.push(client_object)
            }
            else
            {
               
                Constant.translists[index]["connection"] = connection
               
            }
            Constant.interval = setInterval(commonFunction.get_data_of_transcation, 20000);
            connection.on('message', function (message) {
            if(index == -1)
            {
                connection.sendUTF(JSON.stringify({ status: 200, result: true, data: {"uniqueKey": uniqueKey,"transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}, message: "Api Data" }));
            }
            })
        }
        else
        {
            return request.reject(null, request.origin);
        }
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
    async approvekyc(request) {
        try {
           
            let uniqueKey       =  crypto.randomBytes(20).toString('hex')
            let url_paremeters  = url.parse(request.httpRequest.url);
            let queryvariable   = querystring.parse(url_paremeters.query)
            var hash            =  CryptoJS.MD5(queryvariable.api_key + process.env.BASE_WORD_FOR_HASH)
            let getTranscationData = await clients.findOne({ api_key : queryvariable.api_key , status : false})
            console.log("getTranscationData =====================================",getTranscationData);
            console.log(hash);
            console.log(queryvariable.hash);

            if( getTranscationData != null)
            {

            const connection = request.accept(null, request.origin);
            var index = Constant.kycapplication.findIndex(translist => translist.api_key == queryvariable.api_key)
        
            if(index == -1)
            {
            let client_object = {  "uniqueKey": uniqueKey,  "connection": connection,  "api_key": queryvariable.api_key}
            Constant.kycapplication.push(client_object)
            }
            else
            {
              
                Constant.kycapplication[index]["connection"] = connection
            }
            Constant.kycinterval = setInterval(commonFunction.get_data_approvekyc, 10000);

        }
        else
        {
            return request.reject(null, request.origin);
        }
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
    async posTranscationWebScokect(request) {
        try {
            let uniqueKey      =  crypto.randomBytes(20).toString('hex')
            let url_paremeters = url.parse(request.httpRequest.url);
            let queryvariable  = querystring.parse(url_paremeters.query)
            console.log("posTranscationWebScokect =====================================",queryvariable);
            var hash           = CryptoJS.MD5(queryvariable.transkey + queryvariable.apikey +  process.env.BASE_WORD_FOR_HASH)
            let getTranscationData = await commonFunction.get_Transcation_Pos_Data(queryvariable.transkey)
            if(getTranscationData.length > 0)
            {
            const connection   = request.accept(null, request.origin);
            var index = Constant.posTransList.findIndex(translist => translist.transkey == queryvariable.transkey)
            if(index == -1)
            {
            let client_object   = {  "uniqueKey": uniqueKey,  "connection": connection,  "transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}
            Constant.posTransList.push(client_object)
            response            = { amountstatus: 0, status: 200, "data":  {} , message: "Please Wait We are checking" };
            connection.sendUTF(JSON.stringify(response));
            }
            else
            {
                Constant.posTransList[index]["connection"] = connection
                response            = { amountstatus: 0, status: 200, "data":  {} , message: "Please Wait We are checking" };
                connection.sendUTF(JSON.stringify(response));
            }
            Constant.interval  = setInterval(commonFunction.get_data_of_Pos_transcation, 10000);
            connection.on('message', function (message) {
            if(index == -1)
            {
                connection.sendUTF(JSON.stringify({ status: 200, result: true, data: {"uniqueKey": uniqueKey,"transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}, message: "Api Data" }));
            }
            })
        }
        else
        {
            return request.reject(null, request.origin);
        }
        }
        catch (error) {
            console.log(error)
            
            return null
        }
    },
    async paymentLinkTranscationWebScokect(request) {
        try {
            let uniqueKey           =  crypto.randomBytes(20).toString('hex')
            let url_paremeters      = url.parse(request.httpRequest.url);
            let queryvariable       = querystring.parse(url_paremeters.query)
            console.log("paymentLinkTranscationWebScokect =====================================",queryvariable);
            var hash                = CryptoJS.MD5(queryvariable.transkey + queryvariable.apikey +  process.env.BASE_WORD_FOR_HASH)
            let getTranscationData  = await commonFunction.get_Transcation_Paylink_Data(queryvariable.transkey)
            console.log("paymentLinkTranscationWebScokect =====================================",getTranscationData);
            if(getTranscationData.length > 0)
            {
            const connection        = request.accept(null, request.origin);
            var index = Constant.paymenlinkTransList.findIndex(translist => translist.transkey == queryvariable.transkey)
            if(index == -1)
            {
            let client_object  = {  "uniqueKey": uniqueKey,  "connection": connection,  "transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}
            Constant.paymenlinkTransList.push(client_object)
            }
            else
            {
                Constant.paymenlinkTransList[index]["connection"] = connection
            }
            Constant.interval  = setInterval(commonFunction.get_data_of_Paymentlink_transcation, 20000);
            connection.on('message', function (message) {
            if(index == -1)
            {
                connection.sendUTF(JSON.stringify({ status: 200, result: true, data: {"uniqueKey": uniqueKey,"transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}, message: "Api Data" }));
            }
            })
        }
        else
        {
            return request.reject(null, request.origin);
        }
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
    async topupWebScokect(request) {
        try {
            let uniqueKey           =  crypto.randomBytes(20).toString('hex')
            let url_paremeters      = url.parse(request.httpRequest.url);
            let queryvariable       = querystring.parse(url_paremeters.query)
            console.log("topupWebScokect =====================================",queryvariable);
            var hash                = CryptoJS.MD5(queryvariable.transkey + queryvariable.apikey +  process.env.BASE_WORD_FOR_HASH)
            let getTranscationData  = await commonFunction.get_Transcation_quickpayment_Data(queryvariable.transkey)
            console.log("topupWebScokect =====================================",getTranscationData);
            if(getTranscationData.length > 0)
            {
            const connection        = request.accept(null, request.origin);
            var index = Constant.paymenlinkTransList.findIndex(translist => translist.transkey == queryvariable.transkey)
            if(index == -1)
            {
            let client_object  = {  "uniqueKey": uniqueKey,  "connection": connection,  "transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}
            Constant.paymenlinkTransList.push(client_object)
            }
            else
            {
                Constant.paymenlinkTransList[index]["connection"] = connection
            }
            Constant.interval  = setInterval(commonFunction.get_data_of_Paymentlink_transcation, 20000);
            connection.on('message', function (message) {
            if(index == -1)
            {
                connection.sendUTF(JSON.stringify({ status: 200, result: true, data: {"uniqueKey": uniqueKey,"transkey": queryvariable.transkey,  "apikey": queryvariable.apikey}, message: "Api Data" }));
            }
            })
        }
        else
        {
            return request.reject(null, request.origin);
        }
        }
        catch (error) {
            console.log(error)
            return null
        }
    },
}
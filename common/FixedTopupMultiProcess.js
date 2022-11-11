const WebSocketClient = require('websocket').client;
require("dotenv").config()
const topupUtility     = require('./topupUtility');
const Constant        = require('./Constant');

function Create_Node_Sockect_Connection(transid,transkey,apikey,network_id,amount,details,walletdetails) {
    var client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });
   
    client.on('connect', function (connection) {
        console.log('Connection established!');
        connection.on('error', function (error) {
            console.log("Connection error: " + error.toString());
        });
        connection.on('close', function () {
            console.log('Connection closed!');
        });
        connection.on('message', async function (message) {
            console.log("Fixed Multi Porcess message",message)
            let jsondata        = JSON.parse(message.utf8Data)
            let transData       = {}
            var index           = Constant.fixedTopupTransList.findIndex(translist => translist.transkey == jsondata.transid)
            if(index != -1 )
            {
                transData       = Constant.fixedTopupTransList[index]
            }
            if((jsondata.status == 1 || jsondata.status == 3 ) && index != -1)
            {
                let responseapi     = await topupUtility.verifyFixedTheBalance(jsondata.transid,jsondata.status)
                let responseapijson = JSON.parse(responseapi)
                let response        = { transkey : jsondata.transid ,amountstatus: jsondata.status,"paid_in_usd":responseapi.paid_in_usd, "paid": responseapi.paid, status: jsondata.balancedata.status, message: "Success" };
                transData.connection.sendUTF(JSON.stringify(response));
                transData.connection.close(1000)
                Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transid);
            }
            else if (jsondata.status == 2 && index != -1)
            {
                let responseapi     = await topupUtility.partialFixedTheBalance(jsondata.transid)
                let response        = {transkey:jsondata.transid ,amountstatus: jsondata.status ,"paid_in_usd":responseapi.paid_in_usd, "paid": responseapi.paid, status: 200, message: "Transcation Expired" };
                transData.connection.sendUTF(JSON.stringify(response));
                transData.connection.close(1000)
               
            }
            else if (index != -1)
            {
                let transData       = Constant.fixedTopupTransList[index]
                let response        = {transkey:jsondata.transid,amountstatus: jsondata.status, "paid_in_usd": 0, "paid": jsondata.paid, status: jsondata.balancedata.status, message: "Success" };
                let balanceResponse = JSON.stringify(response)
                transData.connection.sendUTF(balanceResponse);
            }
        });
    });
    let url = process.env.FIXED_NODE_WEB_SCOKECT
    url += "transkey="+transkey
    url += "&apikey="+apikey
    url += "&network_id="+network_id
    url += "&amount="+amount
    url += "&transid="+transid
    client.connect(url, '', "");

}

module.exports =
{

    Create_Node_Sockect_Connection: Create_Node_Sockect_Connection,
}
const WebSocketClient = require('websocket').client;
require("dotenv").config()
const topupUtility     = require('./topupUtility');
const Constant        = require('./Constant');

function Create_Node_Sockect_Connection(transid,transkey,apikey,network_id,amount) {
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
            let jsondata        = JSON.parse(message.utf8Data)
            let transData       = Constant.topupTransList[index]
            var index           = Constant.topupTransList.findIndex(translist => translist.transkey == jsondata.transid)
          
            if(index != -1 )
            {
                transData       = Constant.topupTransList[index]
            }
            if((jsondata.status == 1 || jsondata.status == 3 ) && index != -1)
            {
                let responseapi     = await topupUtility.verifyTheBalance(jsondata.transid)
                let responseapijson = JSON.parse(responseapi)
                let response        = {transkey:jsondata.transid ,amountstatus: jsondata.status,"paid_in_usd":jsondata.paid, "paid": jsondata.paid, status: 200, message: "Success" };
                transData.connection.sendUTF(JSON.stringify(response));
                transData.connection.close(1000)
                Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transid);
            }
            else if (jsondata.minutes > 10)
            {
             
                let response        = { transkey:jsondata.transid ,amountstatus: 4,"paid_in_usd":0, "paid": 0, status: 200, message: "Transcation Expirexd" };
                transData.connection.sendUTF(JSON.stringify(response));
                transData.connection.close(1000)
                Constant.topupTransList =  Constant.topupTransList.filter(translist => translist.transkey != jsondata.transid);
            }
            else if (index != -1)
            {
                let transData       = Constant.topupTransList[index]
                let response        = { transkey:jsondata.transid ,amountstatus: jsondata.status,"paid_in_usd":0, "paid": jsondata.paid, status: 200, message: "Success" };
                let balanceResponse = JSON.stringify(response)
                transData.connection.sendUTF(balanceResponse);
            }
        });
    });
    let url = process.env.NODE_WEB_SCOKECT
    url += "transkey="+transkey
    url += "&apikey="+apikey
    url += "&network_id="+network_id
    url += "&amount="+amount
    url += "&transid="+transid
    console.log("============url============",url)
    client.connect(url, '', "");

}

module.exports =
{

    Create_Node_Sockect_Connection: Create_Node_Sockect_Connection,
}
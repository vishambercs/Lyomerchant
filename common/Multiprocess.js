const WebSocketClient  = require('websocket').client;
const Constant         = require('./Constant');
require("dotenv").config()

function Create_Node_Sockect_Connection(transkey,apikey) {
    var client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });
    client.on('connect', function (connection) {
        // console.log('Connection established!');
        connection.on('error', function (error) {
            console.log("Connection error: " + error.toString());
        });
        connection.on('close', function () {
            console.log('Connection closed!');
        });
        connection.on('message', async function (message) 
        {
            let jsondata        =  JSON.parse(message.utf8Data)
            let transData       = {} 
            var index           = Constant.topupTransList.findIndex(translist => translist.transkey == jsondata.transkey)
            console.log("jsondata",jsondata)
            console.log("index",index)
            if(index != -1 )
            {
                transData = Constant.topupTransList[index]
            }

            if((jsondata.amountstatus == 1 || jsondata.amountstatus == 3 ) && index != -1)
            {

                let response        = { amountstatus: jsondata.amountstatus,"paid_in_usd":jsondata.paid_in_usd, "paid": jsondata.paid, status: 200, message: "Success" };
                transData.connection.sendUTF(JSON.stringify(response));
                transData.connection.close(1000)
                Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transkey);
            }
            else if((jsondata.amountstatus == 4 ) && index != -1)
            {
                let response        = { amountstatus: jsondata.amountstatus,"paid_in_usd":jsondata.paid_in_usd, "paid": jsondata.paid, status: 200, message: "Transcation Expired" };
                transData.connection.sendUTF(JSON.stringify(response));
                transData.connection.close(1000)
                Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transkey);
            }
            else if (index != -1)
            {
                let transData       = Constant.topupTransList[index]
                let response        = { amountstatus: jsondata.amountstatus,"paid_in_usd":0, "paid": jsondata.paid, status: 200, message: "Success" };
                let balanceResponse = JSON.stringify(response)
                transData.connection.sendUTF(JSON.stringify(balanceResponse));
            }
        });
    });
    let url = process.env.NODE_WEB_SCOKECT
    url += "transkey="+transkey
    url += "&apikey="+apikey
    // console.log("============url============",url)
    client.connect(url, '', "");

}

module.exports =
{

    Create_Node_Sockect_Connection: Create_Node_Sockect_Connection,
}
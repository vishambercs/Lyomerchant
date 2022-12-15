const WebSocketClient  = require('websocket').client;
const Constant         = require('./Constant');
require("dotenv").config()

function Create_Node_Sockect_Connection(transkey,apikey) {
    var client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());3
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
            if(index != -1 )
            {
                transData = Constant.topupTransList[index]
            }
         
            if((jsondata.amountstatus == 1 || jsondata.amountstatus == 3 ) && index != -1 && jsondata.status == 200)
            {

               
                transData.connection.sendUTF(JSON.stringify(jsondata));
                transData.connection.close(1000)
                Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transkey);
            }
            else if((jsondata.amountstatus == 4 ) && index != -1 && jsondata.status == 200)
            {
                transData.connection.sendUTF(JSON.stringify(jsondata));
                transData.connection.close(1000)
                Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transkey);
            }
            else if(index != -1 && jsondata.status == 400)
            {
                transData.connection.sendUTF(JSON.stringify(jsondata));
                transData.connection.close(1000)
                Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transkey);
            }
            else if (index != -1 && jsondata.status == 200)
            {
                let transData       = Constant.topupTransList[index]
               
                transData.connection.sendUTF(JSON.stringify(jsondata));
            }
        });
    });
    let url = process.env.NODE_WEB_SCOKECT
    url += "transkey="+transkey
    url += "&apikey="+apikey
    client.connect(url, '', "");

}

module.exports =
{

    Create_Node_Sockect_Connection: Create_Node_Sockect_Connection,
}
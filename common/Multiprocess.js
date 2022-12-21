require("dotenv").config()
const WebSocketClient   = require('websocket').client;
const topupUtility      = require('./topupUtility');
const Constant          = require('./Constant');
const Topup             = require('../Models/topup');
const PoolWallet        = require('../Models/poolWallet');
const bscTxTestProvider = require('./bscProvider/bscTxTestProvider');
const bscTxProvider = require('./bscProvider/bscTxProvider');
const ercTxProvider = require('./ercProvider/ercTxProvider');
const trcTxProvider = require('./trcProvider/trcTxProvider');
const btcTxProvider = require('./btcProvider/btcTxProvider');

const network = require('../Models/network');

const removeCheckAddressTx = async (transId) => {
    const toupData = await Topup.findOne({
        id: transId,
    });
    if (toupData) {
        const poolWalletData = await PoolWallet.findOne({
            _id: toupData.pwid,
        });
        if (poolWalletData) {
            const networkData = await network.findOne({
                _id: toupData.nwid,
            });
            if (networkData) {
                if (networkData.coin === 'tUSDT') {
                    bscTxTestProvider.removeAddressToCheckBEP20({
                        address: poolWalletData.address,
                        topup_id: toupData._id,
                    })
                } else {
                    if(['ERC20', 'ETH'].includes(networkData.network)) {
                        ercTxProvider.removeAddressToCheckERC20({
                            address: poolWalletData.address,
                            topup_id: toupData._id,
                        });
                    }
                    if(networkData.network === 'TRC20') {
                        trcTxProvider.removeAddressToCheckTRC20({
                            address: poolWalletData.address,
                            topup_id: toupData._id,
                        })
                    }
                    if (networkData.network === 'BSC') {
                        bscTxProvider.removeAddressToCheckBEP20({
                            address: poolWalletData.address,
                            topup_id: toupData._id,
                        })
                    }
                    if (networkData.network === 'BTC') {
                        btcTxProvider.removeAddressToCheckBTC({
                            address: poolWalletData.address,
                            topup_id: toupData._id,
                        })
                    }
                }
            }
        }
    }
}





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
        connection.on('close', function (ws, response) {
            console.log('Connection closed!', ws.id);
        });
        connection.on('message', async function (message) {
                
            let jsondata        = JSON.parse(message.utf8Data)
            console.log("jsondata",jsondata)
            let transData       = {}
            var index           = Constant.topupTransList.findIndex(translist => translist.transkey == jsondata.transid)
           
           
            if(index != -1 )
            {
                transData       = Constant.topupTransList[index]
            }
            // if((jsondata.status == 1 || jsondata.status == 3 ) && index != -1)
            // {
            //     let responseapi     = await topupUtility.verifyTheBalance(jsondata.transid)
            //     let responseapijson = JSON.parse(responseapi)
            //     let response        = {transkey:jsondata.transid ,amountstatus: jsondata.status,"paymentData":responseapijson.paymentData,  status: jsondata.balancedata.status, message: "Success" };
            //     transData.connection.sendUTF(JSON.stringify(response));
            //     transData.connection.close(1000);
            //     removeCheckAddressTx(jsondata.transId);
            //     Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transid);
            // }
            // if(jsondata.status == 2  && index != -1)
            // {
                 
            //     let responseapi     = await topupUtility.partialTopupBalance(jsondata.transid)
            //     let responseapijson = JSON.parse(responseapi)
            //     let response        = {transkey:jsondata.transid ,amountstatus: jsondata.status,"paymentData":responseapijson.paymentData, status: jsondata.balancedata.status, message: "Success" };
            //     transData.connection.sendUTF(JSON.stringify(response));
            // else }
            if (index != -1)
            {
                let transData       = Constant.topupTransList[index]
                let responseapi     = await topupUtility.checkTopupBalance(jsondata.transid)
                let responseapijson = JSON.parse(responseapi)
               
                let response        = { transkey:jsondata.transid ,amountstatus: responseapijson.amountstatus, "paymentData": responseapijson.paymentData, status: responseapijson.status, message: "Success" };
                let balanceResponse = JSON.stringify(response)
                if(transData != null)
                {
                    transData.connection.sendUTF(balanceResponse);
                }

                if(jsondata.time > 10)
                {
                    Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transid);
                    transData.connection.close(1000);
                    removeCheckAddressTx(jsondata.transId);
                }

                
                if(responseapijson.amountstatus == 3 || responseapijson.amountstatus == 1)
                {

                    Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != jsondata.transid);
                    transData.connection.close(1000);
                    removeCheckAddressTx(jsondata.transId);
                }
            }
        });
    });
    let url = process.env.NODE_WEB_SCOKECT
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
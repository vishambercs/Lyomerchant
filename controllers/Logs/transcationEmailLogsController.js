const transcationEmailLogs = require('../../Models/transcationEmailLogs');
var mongoose = require('mongoose');
require("dotenv").config()

async function getTranscationDataForClient(transID, emailData) {

    
    let transcationEmailLog = await transcationEmailLogs.insertMany(
        [{
            id          : mongoose.Types.ObjectId(),
            trans_id    : transID,
            email_data  : emailData,
            status      : 1,
            created_at  : new Date().toString(),
        }])
    return transcationEmailLog
}

module.exports =
{
    getTranscationDataForClient: getTranscationDataForClient,

}
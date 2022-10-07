const ejs = require('ejs');
const fs = require('fs');
require("dotenv").config()
var nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({ host: "srv.lyotechlabs.com", port: 465, auth: { user: "no-reply@email.lyomerchant.com", pass: "1gbA=0pVVJcS", } });
async function sendEmailFunc(paramters) {
    try {
        let respone = {}
        let views = "./views/emailtemplate/" + paramters.emailTemplateName
        let info = transporter.sendMail
            ({
                from: process.env.FROM,
                to: paramters.to,
                subject: paramters.subject,
                html: ejs.render(fs.readFileSync(views, 'utf-8'), { "data": paramters.templateData }),
            },
                function (error, info) {
                    if (error) {
                        console.log("Message error", error);
                        respone = { status: 400, data: info, message: error }
                    } else {
                        console.log("Message %s sent: %s", info.messageId, info);
                        respone = { status: 200, data: info, message: "Get The Data" }
                    }
                });
        return JSON.stringify(respone)
    }
    catch (error) {
        console.log("Message %s sent: %s", error);
        respone = { status: 400, data: {}, message: error.message }
        return JSON.stringify(respone)
    }
}
module.exports =
{
    sendEmailFunc :sendEmailFunc,
}    
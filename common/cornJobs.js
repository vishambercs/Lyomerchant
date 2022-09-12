const address = []
const block = 0
const index = 0
const Utility = require("./Utility")
const constant = require("./Constant")
const axios = require('axios')
const clientsController = require("../controllers/clientsController")

module.exports =
{
    address: address,
    block: block,
    index: index,
    async Balance_Cron_Job() {
        try {
            constant.address = await Utility.get_Pending_Transcation()
            if (constant.index < constant.address.length) {
                clientsController.get_Balance(constant.address[index])
                constant.index = constant.index + 1 
            }
            else 
            {
                constant.index = 0
               
            }
        }
        catch (error) {
            return JSON.stringify({ status: 400, data: {}, message: error.message })
        }
    },
    
 
}
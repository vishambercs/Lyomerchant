const Validator = require('validatorjs');
const network = require('../Models/network');
const validator = (body, rules, customMessages, callback) => 
{
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

Validator.registerAsync('exist', function (value, attribute, req, passes) {
    network.findOne({ ["id"]: value })
        .then((result) => {
            if (result) {
                passes();
            }
            else {
                passes(false, "Invalid Network ID");
                return;
            }
        })
});
module.exports = validator;
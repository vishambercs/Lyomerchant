const Validator = require('validatorjs');
const network = require('../Models/network');
const Models = require("../Models/clients");
const validator = (body, rules, customMessages, callback) => 
{
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

// Validator.registerAsync('exist', function (value, attribute, req, passes) {
//     network.findOne({ ["id"]: value })
//         .then((result) => {
//             if (result) {
//                 passes();
//             }
//             else {
//                 passes(false, "Invalid Network ID");
//                 return;
//             }
//         })
// });

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;
Validator.register('strict', value => passwordRegex.test(value),
'password must contain at least one uppercase letter, one lowercase letter and one number');


Validator.registerAsync('exist', function(value,  attribute, req, passes) {
    // if (!attribute) throw new Error('Specify Requirements i.e fieldName: exist:table,column');
    // //split table and column
    // let attArr = attribute.split(",");
    // if (attArr.length !== 2) throw new Error(`Invalid format for validation rule on ${attribute}`);

    // //assign array index 0 and 1 to table and column respectively
    // const { 0: table, 1: column } = attArr;
    //define custom error message
    let msg =  `${value} has already been taken `
    //check if incoming value already exists in the database
    Models.findOne({ "email": value })
    .then((result) => {
        if(result){
            passes(false, msg); // return false if value exists
            return;
        }
        passes();
    })
});


module.exports = validator;
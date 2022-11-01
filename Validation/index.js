const Validator         = require('validatorjs');
const networks           = require('../Models/network');
const perferedNetwork   = require('../Models/perferedNetwork');
const Currency          = require('../Models/Currency');
const Models            = require("../Models/clients");

const validator         = (body, rules, customMessages, callback) => 
{
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

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

Validator.registerAsync('decimal', function(value,  attribute, req, passes) {
   
    let msg =  `${value} has invalid Value`
    console.log(parseFloat(value))  
        if(parseFloat(value) <= 0 ){
   
            passes(false, msg); // return false if value exists
            return;
        }
        passes();
    
});

Validator.registerAsync('networkexist', function(value,  attribute, req, passes) 
{
    let msg             =  `Invalid Network`
    let pernetwork      = perferedNetwork.findOne({ "networkid" : value, "status" : 1 })
    let network         = networks.findOne({ "id" : value, "status" : 1 })
    if(network == null) {
        passes(false, msg); // return false if value exists
        return;
    }
    else if(pernetwork == null)
    {
        passes(false, msg); // return false if value exists
        return;
    }
    else 
    {
        passes();
    }
    //  .then((result) => {
    //     if(result == null )
    //     {
    //         passes(false, msg); // return false if value exists
    //         return;
    //     }
    //     passes();
    // })
    
});

Validator.registerAsync('currencyexist', function(value,  attribute, req, passes) 
{
    let msg =  `Invalid Currency`
    Currency.findOne({ "id" : value, "status" : 1 }).then((result) => {
        if(result == null )
        {
            passes(false, msg); // return false if value exists
            return;
        }
        passes();
    })
    
});

module.exports = validator;
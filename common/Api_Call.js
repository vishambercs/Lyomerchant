const axios         = require('axios')
var stringify       = require('json-stringify-safe');
var qs              = require('qs');
async function callPoolWalletAPI(URL, parameters, headers) {
    var data = qs.stringify(parameters);
    // { 
    //     'Content-Type': 'application/x-www-form-urlencoded'
    // },
    response = {}
    var config = {
        method  : 'post',
        url     : URL,
        headers : headers, 
        data    : data
      };
      
    response =  await axios(config)
      .then(function (response) {
        return { status: 200, data: response.data.data, message: "Get The Data From URL" }
      })
      .catch(function (error) {
        console.log("callPoolWalletAPIe rror",error.message);
        return { status: 400, data: {}, message: "Get The Data From URL" }
      });
      

    return response;
}


async function callGetAPI(URL, parameters, headers) {
  var data   = qs.stringify(parameters);
  response   = {}
  var config = { method : 'GET', url : URL, headers : headers,data : data };
    
  response =  await axios(config)
    .then(function (response) {
      return { status: 200, data: response.data.data, message: "Get The Data From URL" }
    })
    .catch(function (error) {
      console.log("callGetAPI rror",error);
      return { status: 400, data: {}, message: "Get The Data From URL" }
    });
  return response;
}

module.exports =
{
    callPoolWalletAPI: callPoolWalletAPI,
    callGetAPI : callGetAPI,
}
var http = require('http');
var express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var client = require('./Route/clientsRoute');
http.createServer(function (request, response) {
   response.writeHead(200, {'Content-Type': 'text/plain'});
   response.end('Hello World! Node.js is working correctly.\n');
}).listen(5000);
console.log('Server running at http://127.0.0.1:5000/');

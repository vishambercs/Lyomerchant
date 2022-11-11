var express                         = require('express');
var router                          = express.Router();
const adminController               = require('../controllers/adminController');
const topupcontroller               = require('../controllers/topup/topupcontroller');
const Auth                          = require('../Validation/Auth');

router.post('/verifytheBalanceTopup',  Auth.Verfiy_WebHook,topupcontroller.verifyTheBalance);



module.exports = router;

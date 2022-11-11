var express                         = require('express');
var router                          = express.Router();
const indexcontrollerntroller       = require('../controllers/indexcontroller');
const Auth                          = require('../Validation/Auth');
router.post('/updateTopUp',          Auth.Verfiy_Merchant,indexcontrollerntroller.updateTopTranscationPoolWallet);
module.exports = router;





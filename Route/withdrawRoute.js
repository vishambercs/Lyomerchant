// var express                 = require('express');
// var router                  = express.Router();
// const withdrawController    = require('../controllers/withdrawController');
// const Auth                  = require('../Validation/Auth');

// router.post('/updateWithdrawRequest',                Auth.is_admin,withdrawController.update_withdraw_request);
// router.post('/withdrawListByNetworkID',              Auth.is_admin,withdrawController.get_admin_wihdraw_with_Network_ID);

// module.exports = router;


var express                 = require('express');
var router                  = express.Router();
const withdrawController    = require('../controllers/withdrawController');
const Auth                  = require('../Validation/Auth');

router.post('/updateWithdrawRequest',                withdrawController.update_withdraw_request);
router.post('/withdrawListByNetworkID',              withdrawController.get_admin_wihdraw_with_Network_ID);

module.exports = router;

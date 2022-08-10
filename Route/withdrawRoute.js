var express                 = require('express');
var router                  = express.Router();
const withdrawController    = require('../controllers/withdrawController');
const Auth                  = require('../Validation/Auth');

router.post('/updateWithdrawRequest',               withdrawController.update_withdraw_request);
router.post('/withdrawListByNetworkID',             withdrawController.get_admin_wihdraw_with_Network_ID);

module.exports = router;

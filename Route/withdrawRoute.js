var express                 = require('express');
var router                  = express.Router();
const withdrawController    = require('../controllers/withdrawController');
const Auth                  = require('../Validation/Auth');

router.post('/updateWithdrawRequest',withdrawController.update_withdraw_request);

module.exports = router;

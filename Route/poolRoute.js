var express = require('express');
var router = express.Router();
const poolController = require('../controllers/poolController');
const Auth = require('../Validation/Auth');

router.post('/get_all_transcation_with_logs',poolController.get_all_transcation_with_logs);
router.post('/get_transcation_balance_to_status',poolController.get_transcation_balance_according_to_status);


module.exports = router;

var express = require('express');
var router = express.Router();
const payLinkController = require('../controllers/paylinkController');


router.get('/storeInvoice',payLinkController.storeInvoice);
router.get('/paymentLink',payLinkController.getPaymentLink);


module.exports = router;
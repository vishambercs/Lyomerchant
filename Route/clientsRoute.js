var express                         = require('express');
var router                          = express.Router();
const topupcontroller               = require('../controllers/topup/topupcontroller');
router.post('/pluginallNetworks',                   topupcontroller.pluginallNetworks);
router.post('/assigntopupMerchantWallet',           topupcontroller.assigntopupMerchantWallet);
router.post('/getTranscationDataofTopup',           topupcontroller.getTranscationDataofTopup);
router.post('/getTransStatus',                      topupcontroller.getTransStatus);
router.post('/canceltopup',                         topupcontroller.canceltopup);
module.exports = router;





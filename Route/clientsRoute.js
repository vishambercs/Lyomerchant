var express                         = require('express');
var router                          = express.Router();
const fixedtopupcontroller               = require('../controllers/topup/fixedtopupcontroller');
router.post('/pluginallNetworks',                   fixedtopupcontroller.pluginallNetworks);
router.post('/assigntopupMerchantWallet',           fixedtopupcontroller.assigntopupMerchantWallet);
router.post('/fixedgettransdataoftopup',            fixedtopupcontroller.fixedgettransdataoftopup);
router.post('/fixedallCurrency',                    fixedtopupcontroller.fixedallCurrency);
router.post('/fixedpriceConversitionChanges',       fixedtopupcontroller.fixedpriceConversitionChanges);

router.post('/getTransStatus',                      fixedtopupcontroller.getTransStatus);
router.post('/canceltopup',                         fixedtopupcontroller.canceltopup);
router.post('/checkbalance',                        fixedtopupcontroller.checkbalance);
router.post('/verfiytranshash',                     fixedtopupcontroller.verfiytranshash);
router.post('/sendotp',                             fixedtopupcontroller.sendotp);
router.post('/updatetrans',                         fixedtopupcontroller.updatetrans);



module.exports = router;





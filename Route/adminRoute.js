var express                         = require('express');
var router                          = express.Router();
const adminController               = require('../controllers/adminController');
const transcationpoolController     = require('../controllers/transcationpoolController');
const withdrawController            = require('../controllers/withdrawController');
const Auth              = require('../Validation/Auth');
router.post('/signupadmin',         adminController.signup_admin_api);
router.post('/adminlogin',          adminController.Login);
router.post('/admingoogleauth',     adminController.Verfiy_Google_Auth);
router.post('/getTransForAdmin',    transcationpoolController.getTransForAdmin);
router.post('/get_admin_withdraw',  withdrawController.get_admin_wihdraw);
router.post('/allAdmin',            adminController.allAdmin);
router.post('/sendemail',           adminController.sendEmail);

module.exports = router;

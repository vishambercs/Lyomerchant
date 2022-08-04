var express             = require('express');
var router              = express.Router();
const adminController   = require('../controllers/adminController');
const Auth              = require('../Validation/Auth');
router.post('/signupadmin',      adminController.signup_admin_api);
router.post('/adminlogin',       adminController.Login);
router.post('/admingoogleauth',  adminController.Verfiy_Google_Auth);
module.exports = router;

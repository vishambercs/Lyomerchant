// var express                 = require('express');
// var router                  = express.Router();
// const networkController     = require('../controllers/networkController');
// const Auth                  = require('../Validation/Auth');
// router.post('/createNetwork',                Auth.is_admin,networkController.create_Network);
// router.get('/allNetwork',                    Auth.is_admin,networkController.all_network);
// router.post('/updateNetwork',                Auth.is_admin,networkController.update_Network);
// router.post('/deleteNetwork',                Auth.is_admin,networkController.delete_network);
// router.post('/changeStatusNetwork',          Auth.is_admin,networkController.change_status_network);
// router.post('/changeHotWalletStatusLimit',   Auth.is_admin,networkController.changeHotWalletStatusLimit);
// router.post('/updateprefixandimage',         Auth.is_admin,networkController.updateprefixandimage);
// router.post('/updatecurrencyid',             Auth.is_admin,networkController.updatecurrencyid);


// module.exports = router;


var express                 = require('express');
var router                  = express.Router();
const networkController     = require('../controllers/networkController');
const Auth                  = require('../Validation/Auth');
router.post('/createNetwork',                  networkController.create_Network);
router.get('/allNetwork',                      Auth.is_admin,networkController.all_network);
router.post('/updateNetwork',                 Auth.is_admin, networkController.update_Network);
router.post('/deleteNetwork',                 Auth.is_admin, networkController.delete_network);
router.post('/changeStatusNetwork',            Auth.is_admin,networkController.change_status_network);
router.post('/changeHotWalletStatusLimit',    Auth.is_admin, networkController.changeHotWalletStatusLimit);
router.post('/updateprefixandimage',           Auth.is_admin,networkController.updateprefixandimage);
router.post('/updatecurrencyid',              Auth.is_admin, networkController.updatecurrencyid);
router.post('/updategasimit',              Auth.is_admin, networkController.updategasimit);


module.exports = router;

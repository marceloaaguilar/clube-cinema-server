const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authController = require('./../controllers/authController');

router 
  .route('/')
  .get(authController.protect, voucherController.getAllVouchers)
  .post(authController.protect, voucherController.createVoucher)

router 
  .route('/code')
  .get(authController.protect, voucherController.getAllVouchersWithCode);

router 
  .route('/book')
  .post(voucherController.bookVoucher);
  
router
  .route('/:id')
  .get(authController.protect, voucherController.getVoucher)
  .delete(authController.protect, voucherController.deleteVoucher)



// router.get('/', voucherController.getAllVouchers);
// router.get('/:id', voucherController.getVoucherById);
// router.get('/establishment/:establishmentId', voucherController.getVouchersByEstablishment);
// router.post(authController.protect, '/', voucherController.createVoucher);
// router.put('/:id', voucherController.updateVoucher);
// router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;

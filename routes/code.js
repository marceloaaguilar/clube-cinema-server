const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const authController = require('./../controllers/authController');

router 
  .route('/')
  .post(authController.protect, codeController.createCodes);

router
  .route('/barcode/:voucherId')
  .get(authController.protect, codeController.getCodesByVoucherId);

router
  .route('/manualSale')
  .post(authController.protect, codeController.createManualSale);

module.exports = router;
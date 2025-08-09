const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

router.route('/')
  .get(authController.protect, orderController.getOrdersWithBarCode);

module.exports = router;

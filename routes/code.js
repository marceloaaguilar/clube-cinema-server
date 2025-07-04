const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const authController = require('./../controllers/authController');

router 
  .route('/')
  .post(authController.protect, codeController.createCodes)

module.exports = router;
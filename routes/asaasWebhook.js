const express = require('express');
const router = express.Router();
const asaasWebhookController = require('../controllers/asaasWebhookController');

router.post('/', asaasWebhookController.handleWebhook);

module.exports = router;

const express = require('express');
const router = express.Router();
const voucherReservationHistoryController = require('../controllers/voucherReservationHistory');

router.route('/')
  .post(voucherReservationHistoryController.create)
  .get(voucherReservationHistoryController.list);

router.route('/:id')
  .get(voucherReservationHistoryController.getById)
  .put(voucherReservationHistoryController.update)
  .delete(voucherReservationHistoryController.delete);

module.exports = router;

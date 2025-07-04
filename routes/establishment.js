const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const establishmentController = require('../controllers/establishmentController');
const authController = require('../controllers/authController');

router
  .route("/")
  .get(authController.protect, establishmentController.getAllEstablishments)
  .post(authController.protect, upload.single('logo'), establishmentController.createEstablishment)

router
  .route("/:id")
  .get(authController.protect, establishmentController.getEstablishment)
  .patch(authController.protect, upload.single('logo'), establishmentController.updateEstablishment)
  .delete(authController.protect, establishmentController.deleteEstablishment)

module.exports = router;
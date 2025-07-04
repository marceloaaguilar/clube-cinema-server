const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const clientController = require('../controllers/clientController');
const authController = require('../controllers/authController');

router
  .route("/")
  .get(authController.protect, clientController.getAllClients)
  .post(authController.protect, upload.single('logo'), clientController.createClient)

router
  .route("/:id")
  .get(authController.protect, clientController.getClient)
  .patch(authController.protect, upload.single('logo'), clientController.updateClient)
  .delete(authController.protect, clientController.deleteClient)

module.exports = router;
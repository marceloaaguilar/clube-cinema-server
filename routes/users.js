const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.post('/login', authController.signin);
router.post('/logout', authController.logout);

router 
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(authController.signup)

router
  .route('/verify-token')
  .get(userController.verifyToken)

router
  .route("/:id")
  .get(authController.protect, userController.getUser)
  .patch(authController.protect, userController.updateUser)
  .delete(authController.protect, userController.deleteUser)

module.exports = router;
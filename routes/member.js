const express = require('express');
const authController = require('./../controllers/authController');
const memberController = require('./../controllers/memberController');

const router = express.Router();

router 
  .route('/')
  .get(authController.protect, memberController.getAllMembers)
  .post(authController.protect, memberController.createMember)

router
  .route("/:id")
  .get(authController.protect, memberController.getMember)
  .patch(authController.protect, memberController.updateMember)
  .delete(authController.protect, memberController.deleteMember)

module.exports = router;
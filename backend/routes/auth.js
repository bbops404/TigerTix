const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");

router.post("/check-user", authController.checkUser);
router.post("/send-otp", authController.sendOTP);
router.post("/validate-otp", authController.validateOTP);
router.post("/signUp", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/validate-password-reset-otp", authController.validatePasswordResetOTP);
router.post("/reset-password", authController.resetPassword);


module.exports = router;

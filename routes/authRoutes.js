const express = require("express");

const authController = require("../controllers/authController");
const { ensureGuest } = require("../middlewares/authMiddleware");
const { handleValidationErrors } = require("../middlewares/validationMiddleware");
const { authLimiter } = require("../middlewares/securityMiddleware");

const router = express.Router();

router.get("/", ensureGuest, (req, res) => res.redirect("/login"));
router.get("/register", ensureGuest, authController.showRegister);
router.post(
  "/register",
  ensureGuest,
  authLimiter,
  authController.registerValidators,
  handleValidationErrors("auth/register"),
  authController.register
);

router.get("/login", ensureGuest, authController.showLogin);
router.post(
  "/login",
  ensureGuest,
  authLimiter,
  authController.loginValidators,
  handleValidationErrors("auth/login"),
  authController.login
);

router.post("/logout", authController.logout);

module.exports = router;

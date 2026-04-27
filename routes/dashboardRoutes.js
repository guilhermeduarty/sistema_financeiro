const express = require("express");

const dashboardController = require("../controllers/dashboardController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/dashboard", ensureAuthenticated, dashboardController.index);

module.exports = router;

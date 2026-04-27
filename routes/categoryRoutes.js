const express = require("express");

const categoryController = require("../controllers/categoryController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { handleValidationErrors } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.get("/categorias", ensureAuthenticated, categoryController.index);
router.post(
  "/categorias",
  ensureAuthenticated,
  categoryController.categoryValidators,
  handleValidationErrors(),
  categoryController.create
);
router.put(
  "/categorias/:id",
  ensureAuthenticated,
  categoryController.categoryValidators,
  handleValidationErrors(),
  categoryController.update
);
router.delete("/categorias/:id", ensureAuthenticated, categoryController.remove);

module.exports = router;

const express = require("express");

const transactionController = require("../controllers/transactionController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { handleValidationErrors } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.get("/transacoes/nova", ensureAuthenticated, transactionController.showCreateForm);
router.post(
  "/transacoes",
  ensureAuthenticated,
  transactionController.transactionValidators,
  handleValidationErrors(),
  transactionController.create
);
router.get("/transacoes/:id/editar", ensureAuthenticated, transactionController.showEditForm);
router.put(
  "/transacoes/:id",
  ensureAuthenticated,
  transactionController.transactionValidators,
  handleValidationErrors(),
  transactionController.update
);
router.delete("/transacoes/:id", ensureAuthenticated, transactionController.remove);

router.get("/receitas", ensureAuthenticated, (req, res, next) => {
  req.params.tipo = "receita";
  transactionController.listByType(req, res, next);
});

router.get("/despesas", ensureAuthenticated, (req, res, next) => {
  req.params.tipo = "despesa";
  transactionController.listByType(req, res, next);
});

router.get("/historico", ensureAuthenticated, transactionController.history);

module.exports = router;

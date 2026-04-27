const { body } = require("express-validator");

const Category = require("../models/Category");
const Transaction = require("../models/Transaction");

const transactionValidators = [
  body("tipo")
    .isIn(["receita", "despesa"])
    .withMessage("Selecione um tipo de transacao valido."),
  body("valor")
    .isFloat({ gt: 0 })
    .withMessage("Informe um valor maior que zero."),
  body("data").isISO8601().withMessage("Informe uma data valida."),
  body("descricao").trim().escape().notEmpty().withMessage("Informe uma descricao.")
];

async function renderForm(res, viewData) {
  res.render("transactions/form", viewData);
}

async function showCreateForm(req, res, next) {
  try {
    const categories = await Category.findAllByUser(req.session.user.id);

    await renderForm(res, {
      title: "Nova transacao",
      categories,
      transaction: {},
      formAction: "/transacoes",
      formMethod: "POST"
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    await Transaction.create({
      userId: req.session.user.id,
      tipo: req.body.tipo,
      valor: req.body.valor,
      categoriaId: req.body.categoria_id,
      data: req.body.data,
      descricao: req.body.descricao
    });

    req.flash("success_msg", "Transacao cadastrada com sucesso.");
    res.redirect(req.body.tipo === "receita" ? "/receitas" : "/despesas");
  } catch (error) {
    next(error);
  }
}

async function listByType(req, res, next) {
  try {
    const tipo = req.params.tipo;
    const title = tipo === "receita" ? "Receitas" : "Despesas";
    const transactions = await Transaction.findAllByUser(req.session.user.id, { tipo });

    res.render("transactions/index", {
      title,
      pageType: tipo,
      transactions,
      filters: {}
    });
  } catch (error) {
    next(error);
  }
}

async function showEditForm(req, res, next) {
  try {
    const [transaction, categories] = await Promise.all([
      Transaction.findById(req.params.id, req.session.user.id),
      Category.findAllByUser(req.session.user.id)
    ]);

    if (!transaction) {
      req.flash("error_msg", "Transacao nao encontrada.");
      return res.redirect("/historico");
    }

    await renderForm(res, {
      title: "Editar transacao",
      categories,
      transaction,
      formAction: `/transacoes/${transaction.id}?_method=PUT`,
      formMethod: "POST"
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.id, req.session.user.id);

    if (!transaction) {
      req.flash("error_msg", "Transacao nao encontrada.");
      return res.redirect("/historico");
    }

    await Transaction.update(req.params.id, req.session.user.id, {
      tipo: req.body.tipo,
      valor: req.body.valor,
      categoriaId: req.body.categoria_id,
      data: req.body.data,
      descricao: req.body.descricao
    });

    req.flash("success_msg", "Transacao atualizada com sucesso.");
    res.redirect("/historico");
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.id, req.session.user.id);

    if (!transaction) {
      req.flash("error_msg", "Transacao nao encontrada.");
      return res.redirect("/historico");
    }

    await Transaction.delete(req.params.id, req.session.user.id);
    req.flash("success_msg", "Transacao excluida com sucesso.");
    res.redirect("/historico");
  } catch (error) {
    next(error);
  }
}

async function history(req, res, next) {
  try {
    const filters = {
      dataInicial: req.query.dataInicial || "",
      dataFinal: req.query.dataFinal || ""
    };

    const transactions = await Transaction.findAllByUser(req.session.user.id, filters);

    res.render("transactions/history", {
      title: "Historico",
      transactions,
      filters
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  transactionValidators,
  showCreateForm,
  create,
  listByType,
  showEditForm,
  update,
  remove,
  history
};

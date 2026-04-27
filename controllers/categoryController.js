const { body } = require("express-validator");

const Category = require("../models/Category");

const categoryValidators = [
  body("nome").trim().escape().notEmpty().withMessage("Informe o nome da categoria.")
];

async function index(req, res, next) {
  try {
    const categories = await Category.findAllByUser(req.session.user.id);

    res.render("categories/index", {
      title: "Categorias",
      categories,
      formData: {}
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    await Category.create({
      nome: req.body.nome,
      userId: req.session.user.id
    });

    req.flash("success_msg", "Categoria criada com sucesso.");
    res.redirect("/categorias");
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const category = await Category.findById(req.params.id, req.session.user.id);

    if (!category) {
      req.flash("error_msg", "Categoria nao encontrada.");
      return res.redirect("/categorias");
    }

    await Category.update(req.params.id, req.session.user.id, req.body.nome);
    req.flash("success_msg", "Categoria atualizada com sucesso.");
    res.redirect("/categorias");
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const category = await Category.findById(req.params.id, req.session.user.id);

    if (!category) {
      req.flash("error_msg", "Categoria nao encontrada.");
      return res.redirect("/categorias");
    }

    await Category.delete(req.params.id, req.session.user.id);
    req.flash("success_msg", "Categoria excluida com sucesso.");
    res.redirect("/categorias");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  categoryValidators,
  index,
  create,
  update,
  remove
};

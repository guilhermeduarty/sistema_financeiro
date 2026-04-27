const bcrypt = require("bcrypt");
const { body } = require("express-validator");

const User = require("../models/User");
const Category = require("../models/Category");

const registerValidators = [
  body("nome").trim().escape().notEmpty().withMessage("Informe seu nome."),
  body("email").trim().isEmail().withMessage("Informe um e-mail valido.").normalizeEmail(),
  body("senha")
    .isLength({ min: 6 })
    .withMessage("A senha precisa ter pelo menos 6 caracteres."),
  body("confirmarSenha")
    .custom((value, { req }) => value === req.body.senha)
    .withMessage("As senhas nao conferem.")
];

const loginValidators = [
  body("email").trim().isEmail().withMessage("Informe um e-mail valido.").normalizeEmail(),
  body("senha").notEmpty().withMessage("Informe sua senha.")
];

function showRegister(req, res) {
  res.render("auth/register", {
    title: "Criar conta",
    formData: {}
  });
}

function showLogin(req, res) {
  res.render("auth/login", {
    title: "Entrar",
    formData: {}
  });
}

async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      req.flash("error_msg", "Ja existe uma conta cadastrada com este e-mail.");
      return res.status(409).render("auth/register", {
        title: "Criar conta",
        formData: req.body
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const userId = await User.create({
      nome,
      email,
      senha: hashedPassword
    });

    // Categorias padrao para ajudar o usuario a comecar o controle financeiro.
    const defaultCategories = ["Alimentacao", "Transporte", "Moradia", "Salario", "Lazer"];
    await Promise.all(defaultCategories.map((categoria) => Category.create({ nome: categoria, userId })));

    req.flash("success_msg", "Conta criada com sucesso. Faca login para continuar.");
    return res.redirect("/login");
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      req.flash("error_msg", "Credenciais invalidas.");
      return res.status(401).render("auth/login", {
        title: "Entrar",
        formData: req.body
      });
    }

    const passwordMatches = await bcrypt.compare(senha, user.senha);

    if (!passwordMatches) {
      req.flash("error_msg", "Credenciais invalidas.");
      return res.status(401).render("auth/login", {
        title: "Entrar",
        formData: req.body
      });
    }

    req.session.user = {
      id: user.id,
      nome: user.nome,
      email: user.email
    };

    req.flash("success_msg", `Bem-vindo de volta, ${user.nome}!`);
    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.redirect("/login");
  });
}

module.exports = {
  registerValidators,
  loginValidators,
  showRegister,
  showLogin,
  register,
  login,
  logout
};

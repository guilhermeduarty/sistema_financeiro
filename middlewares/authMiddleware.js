function ensureAuthenticated(req, res, next) {
  if (!req.session.user) {
    req.flash("error_msg", "Voce precisa fazer login para acessar esta pagina.");
    return res.redirect("/login");
  }

  next();
}

function ensureGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  next();
}

module.exports = {
  ensureAuthenticated,
  ensureGuest
};

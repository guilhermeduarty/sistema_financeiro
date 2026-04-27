const { validationResult } = require("express-validator");

function handleValidationErrors(viewName) {
  return (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    req.flash("error_msg", "Revise os campos obrigatorios e tente novamente.");
    req.flash("validationErrors", errors.array());

    if (viewName) {
      res.locals.error_msg = ["Revise os campos obrigatorios e tente novamente."];
      res.locals.validationErrors = errors.array();

      return res.status(422).render(viewName, {
        title: "Formulario com erros",
        formData: req.body
      });
    }

    return res.redirect(req.get("Referrer") || "/dashboard");
  };
}

module.exports = {
  handleValidationErrors
};

const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const hpp = require("hpp");

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Muitas requisicoes enviadas. Aguarde alguns minutos e tente novamente."
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: "Muitas tentativas de autenticacao. Aguarde e tente novamente."
});

const csrfProtection = csrf();

function forceHttps(req, res, next) {
  const shouldForceHttps = process.env.FORCE_HTTPS === "true";
  const isSecureRequest = req.secure || req.headers["x-forwarded-proto"] === "https";

  if (shouldForceHttps && !isSecureRequest) {
    return res.redirect(`https://${req.headers.host}${req.originalUrl}`);
  }

  return next();
}

function sanitizeRequest(req, res, next) {
  hpp()(req, res, () => {
    const sanitizeObject = (target) => {
      if (!target || typeof target !== "object") {
        return;
      }

      Object.keys(target).forEach((key) => {
        const value = target[key];

        if (typeof value === "string") {
          target[key] = value.trim();
        } else if (value && typeof value === "object") {
          sanitizeObject(value);
        }
      });
    };

    sanitizeObject(req.body);
    sanitizeObject(req.query);
    next();
  });
}

function securityHeaders(req, res, next) {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
}

module.exports = {
  globalLimiter,
  authLimiter,
  csrfProtection,
  forceHttps,
  sanitizeRequest,
  securityHeaders
};

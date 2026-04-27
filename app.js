require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const helmet = require("helmet");
const compression = require("compression");
const MySQLStoreFactory = require("express-mysql-session");

const { testConnection } = require("./config/db");
const {
  globalLimiter,
  csrfProtection,
  forceHttps,
  sanitizeRequest,
  securityHeaders
} = require("./middlewares/securityMiddleware");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const MySQLStore = MySQLStoreFactory(session);
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
  styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
  imgSrc: ["'self'", "data:"],
  fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
  connectSrc: ["'self'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"]
};

if (isProduction) {
  cspDirectives.upgradeInsecureRequests = [];
}

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sistema_financeiro",
  clearExpired: true,
  checkExpirationInterval: 1000 * 60 * 15,
  expiration: Number(process.env.SESSION_MAX_AGE || 1000 * 60 * 60 * 8),
  createDatabaseTable: true
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");

if (Number(process.env.TRUST_PROXY || 0) > 0) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY));
}

app.use(forceHttps);
app.use(globalLimiter);
app.use(securityHeaders);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives
    },
    crossOriginEmbedderPolicy: false
  })
);
app.use(compression());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.use(sanitizeRequest);
app.use(methodOverride("_method"));
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "7d",
    etag: true
  })
);

app.use(
  session({
    name: process.env.SESSION_NAME || "financeflow.sid",
    secret: process.env.SESSION_SECRET || "segredo_padrao_troque_em_producao",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction || process.env.FORCE_HTTPS === "true",
      sameSite: "lax",
      maxAge: Number(process.env.SESSION_MAX_AGE || 1000 * 60 * 60 * 8)
    }
  })
);

app.use(flash());
app.use(csrfProtection);

// Disponibiliza informacoes globais para todas as views.
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.validationErrors = req.flash("validationErrors").flat();
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", transactionRoutes);
app.use("/", categoryRoutes);

app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).render("partials/error-page", {
    title: "Pagina nao encontrada",
    message: "A pagina que voce tentou acessar nao existe."
  });
});

app.use((error, req, res, next) => {
  if (error.code === "EBADCSRFTOKEN") {
    req.flash("error_msg", "Sua sessao de formulario expirou. Tente novamente.");
    return res.redirect(req.get("Referrer") || "/login");
  }

  console.error(error);
  res.status(500).render("partials/error-page", {
    title: "Erro interno",
    message: "Ocorreu um erro inesperado. Tente novamente em instantes."
  });
});

testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Falha ao iniciar a aplicacao:", error.message);
  });

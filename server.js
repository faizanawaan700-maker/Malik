require("dotenv").config();

const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "";

if (!ACCESS_PASSWORD || ACCESS_PASSWORD.startsWith("replace-this")) {
  console.error("SETUP REQUIRED: Add your private password to the .env file.");
  process.exit(1);
}
if (SESSION_SECRET.length < 32 || SESSION_SECRET.startsWith("replace-this")) {
  console.error("SETUP REQUIRED: Add a random SESSION_SECRET of at least 32 characters to the .env file.");
  process.exit(1);
}

app.disable("x-powered-by");
if (process.env.TRUST_PROXY_HOPS) {
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 1) {
    console.error("CONFIGURATION ERROR: TRUST_PROXY_HOPS must be a positive integer.");
    process.exit(1);
  }
  app.set("trust proxy", trustProxyHops);
}
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      mediaSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(session({
  name: "zahra_private_session",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 4 * 60 * 60 * 1000
  }
}));

const unlockLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many attempts. Please wait a little and try again."
});

const publicDir = path.join(__dirname, "public");
app.use("/assets", express.static(path.join(publicDir, "assets"), {
  maxAge: "1h",
  index: false,
  dotfiles: "deny"
}));
app.use("/media", (req, res, next) => {
  if (req.session && req.session.authorized === true) {
    res.set("Cache-Control", "no-store");
    return next();
  }
  return res.redirect("/");
}, express.static(path.join(publicDir, "media"), {
  maxAge: "1h",
  index: false,
  dotfiles: "deny"
}));

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function requireAccess(req, res, next) {
  if (req.session && req.session.authorized === true) return next();
  return res.redirect("/");
}

app.get("/", (req, res) => {
  if (req.session && req.session.authorized) return res.redirect("/experience");
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(publicDir, "index.html"));
});

app.post("/unlock", unlockLimiter, (req, res, next) => {
  const submitted = String(req.body.password || "");
  if (!safeEqual(submitted, ACCESS_PASSWORD)) {
    return res.redirect("/?error=1");
  }
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.authorized = true;
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr);
      res.redirect("/experience");
    });
  });
});

app.get("/experience", requireAccess, (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(publicDir, "experience.html"));
});

app.post("/close", requireAccess, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("zahra_private_session");
    res.redirect("/");
  });
});

app.use((req, res) => res.status(404).send("This private page could not be found."));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong. Please try again.");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Zahra Birthday Experience running at http://localhost:${PORT}`);
  console.log("Keep this terminal open while the private link is in use.");
});

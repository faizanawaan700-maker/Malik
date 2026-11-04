require("dotenv").config();

const express = require("express");
const cookieSession = require("cookie-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "";

if (!ACCESS_PASSWORD || ACCESS_PASSWORD.startsWith("replace-this")) {
  throw new Error("SETUP REQUIRED: Configure ACCESS_PASSWORD in the environment.");
}
if (SESSION_SECRET.length < 32 || SESSION_SECRET.startsWith("replace-this")) {
  throw new Error("SETUP REQUIRED: Configure SESSION_SECRET with at least 32 characters.");
}

app.disable("x-powered-by");
if (process.env.TRUST_PROXY_HOPS) {
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 1) {
    throw new Error("CONFIGURATION ERROR: TRUST_PROXY_HOPS must be a positive integer.");
  }
  app.set("trust proxy", trustProxyHops);
} else if (process.env.VERCEL === "1") {
  app.set("trust proxy", 1);
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
      formAction: ["'self'", "https://wa.me", "https://api.whatsapp.com"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieSession({
  name: "zahra_private_session",
  keys: [SESSION_SECRET],
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
  sameSite: "strict",
  maxAge: 4 * 60 * 60 * 1000,
  path: "/"
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
  req.session = { authorized: true };
  return res.redirect("/experience");
});

app.get("/experience", requireAccess, (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(publicDir, "experience.html"));
});

app.post("/send-wish", requireAccess, (req, res) => {
  const submittedWish = req.body.wish;
  if (typeof submittedWish !== "string") {
    return res.redirect(303, "/experience?wish=invalid#make-a-wish");
  }

  const wish = submittedWish.trim();
  if (!wish || wish.length > 300) {
    return res.redirect(303, "/experience?wish=invalid#make-a-wish");
  }

  const configuredNumber = (process.env.WHATSAPP_NUMBER || "").trim();
  if (!/^\+?[0-9][0-9\s().-]*$/.test(configuredNumber)) {
    return res.redirect(303, "/experience?wish=unavailable#make-a-wish");
  }

  const recipient = configuredNumber.replace(/\D/g, "");
  if (!/^[1-9]\d{7,14}$/.test(recipient)) {
    return res.redirect(303, "/experience?wish=unavailable#make-a-wish");
  }

  const whatsappUrl = `https://wa.me/${recipient}?text=${encodeURIComponent(wish)}`;
  return res.redirect(303, whatsappUrl);
});

app.post("/close", requireAccess, (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.use((req, res) => res.status(404).send("This private page could not be found."));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong. Please try again.");
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Zahra Birthday Experience running at http://localhost:${PORT}`);
    console.log("Keep this terminal open while the private link is in use.");
  });
}

module.exports = app;

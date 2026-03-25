const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PROXY_SECRET = process.env.PROXY_SECRET;

// Load mTLS client certificates for outbound requests
const certPath = path.join(__dirname, "certs", "certificate.pem");
const keyPath = path.join(__dirname, "certs", "key.pem");

const tlsAgent =
  fs.existsSync(certPath) && fs.existsSync(keyPath)
    ? new https.Agent({
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      })
    : undefined;

// Authentication middleware
function authenticate(req, res, next) {
  // Validar autenticação: aceitar x-proxy-secret OU Authorization Bearer
  const xProxySecret = req.headers["x-proxy-secret"];
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader?.replace("Bearer ", "");

  const isValidSecret = xProxySecret === PROXY_SECRET;
  const isValidBearer = bearerToken === PROXY_SECRET;

  if (!isValidSecret && !isValidBearer) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

app.use(express.json());
app.use(authenticate);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

http.createServer(app).listen(PORT, () => {
  console.log(`efi-mtls-proxy listening on port ${PORT}`);
});
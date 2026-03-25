// Validar autenticação: aceitar x-proxy-secret OU Authorization Bearer
const xProxySecret = req.headers["x-proxy-secret"];
const authHeader = req.headers["authorization"];
const bearerToken = authHeader?.replace("Bearer ", "");

const isValidSecret = xProxySecret === PROXY_SECRET;
const isValidBearer = bearerToken === PROXY_SECRET;

if (!isValidSecret && !isValidBearer) {
  return res.status(401).json({ error: "Unauthorized" });
}
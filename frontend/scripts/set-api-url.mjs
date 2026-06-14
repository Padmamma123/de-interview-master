import fs from "node:fs";

function normalizeBackendHost(rawHost) {
  const host = (rawHost || "deim-backend.onrender.com").trim();
  if (host.includes(".")) {
    return host;
  }
  return `${host}.onrender.com`;
}

const host = normalizeBackendHost(process.env.BACKEND_HOST);
const apiUrl = process.env.VITE_API_URL || `https://${host}/api`;

fs.writeFileSync(".env.production.local", `VITE_API_URL=${apiUrl}\n`);
console.log(`Using VITE_API_URL=${apiUrl}`);

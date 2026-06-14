import fs from "node:fs";

const host = process.env.BACKEND_HOST || "deim-backend.onrender.com";
const apiUrl = `https://${host}/api`;

fs.writeFileSync(".env.production.local", `VITE_API_URL=${apiUrl}\n`);
console.log(`Using VITE_API_URL=${apiUrl}`);

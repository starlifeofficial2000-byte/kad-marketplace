const rawServer = import.meta.env.VITE_API_SERVER || import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
const SERVER_URL = String(rawServer || "").trim().replace(/\/+$/, "").replace(/\/api$/i, "");
export default SERVER_URL;

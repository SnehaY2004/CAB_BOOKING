const API_BASE = "https://cab-booking-uk6z.onrender.com/api";

function getServerHint() {
  const base = API_BASE || "proxy (see vite.config proxy target)";
  return `Backend URL: ${base}. Ensure the server is running and the URL/port match.`;
}

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch (err) {
    const msg = err.message || "fetch failed";
    throw new Error(
      msg.includes("fetch failed") || msg.includes("Failed to fetch")
        ? `Cannot reach server. Is the backend running? Set VITE_API_URL in client .env (e.g. https://cab-booking-xi.vercel.app). ${getServerHint()}`
        : msg,
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.message || res.statusText || "Request failed");
  return data;
}

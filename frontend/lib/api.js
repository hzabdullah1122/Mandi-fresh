export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Photos uploaded by the admin are served by the backend at /api/images/<id>.
// Everything else (/products/x.jpg or an https link) works as it is.
export const imageSrc = (src) => (src && src.startsWith("/api/") ? API.replace(/\/api$/, "") + src : src);

export async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

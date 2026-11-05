import axios from "axios";



const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export async function apiRequest(first, second, third) {
  let method = "GET";
  let endpoint;
  let data;
  let headers;

  if (typeof first !== "string") {
    throw new Error("apiRequest requires a URL or HTTP method.");
  }

  // Format: apiRequest("GET", "/leads", data)
  if (HTTP_METHODS.includes(first.toUpperCase())) {
    method = first.toUpperCase();
    endpoint = second;

    if (third !== undefined) {
      data = third;
    }
  } else {
    // Format: apiRequest("/leads")
    // Format: apiRequest("/leads", { method: "POST", body: ... })
    // Format: apiRequest("/users", "POST", data)
    endpoint = first;

    if (typeof second === "string") {
      method = second.toUpperCase();
      data = third;
    } else if (second && typeof second === "object") {
      method = (second.method || "GET").toUpperCase();
      headers = second.headers;

      if (second.data !== undefined) {
        data = second.data;
      } else if (second.body !== undefined) {
        data = second.body;

        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            // Keep non-JSON request bodies unchanged.
          }
        }
      }
    }
  }

  if (typeof endpoint !== "string" || !endpoint.startsWith("/")) {
    throw new Error("apiRequest endpoint must start with '/'.");
  }

  if (!HTTP_METHODS.includes(method)) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  const response = await api.request({
    method,
    url: endpoint,
    ...(data !== undefined &&
    !["GET", "DELETE"].includes(method)
      ? { data }
      : {}),
    ...(headers ? { headers } : {}),
  });

  return response.data;
}

export default api;
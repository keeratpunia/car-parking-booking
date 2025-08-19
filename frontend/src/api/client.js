export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = data?.message || (typeof data === "string" ? data : "Request failed");
    throw new Error(msg);
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, { method: "POST", body: b }),
  patch: (p, b) => request(p, { method: "PATCH", body: b }),
  del: (p) => request(p, { method: "DELETE" }),
};


export const locationsApi = {
  list: (q = "", page = 1, limit = 10) =>
    api.get(`/locations?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),
  get: (id) => api.get(`/locations/${id}`),
};

export const availabilityApi = {
  get: ({ locationId, startTime, endTime }) =>
    api.get(
      `/availability?locationId=${locationId}&startTime=${encodeURIComponent(
        startTime
      )}&endTime=${encodeURIComponent(endTime)}`
    ),
};

export const bookingsApi = {
  my: () => api.get(`/bookings/my`),
  create: (payload) => api.post(`/bookings`, payload),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`, {}),
};

export const adminLocationsApi = {
  list: (query = "") => api.get(`/locations?q=${encodeURIComponent(query)}`),
  create: (payload) => api.post(`/locations`, payload),
  update: (id, payload) => api.patch(`/locations/${id}`, payload),
  softDelete: (id) => api.del(`/locations/${id}`), // backend makes isActive=false
};

export const adminSlotsApi = {
  // list & create stay under the location
  list: (locId) => api.get(`/locations/${locId}/slots`),
  create: (locId, payload) => api.post(`/locations/${locId}/slots`, payload),

  // update / deactivate are by slotId only (backend expects /slots/:id)
  update: (slotId, payload) => api.patch(`/slots/${slotId}`, payload),
  deactivate: (slotId) => api.del(`/slots/${slotId}`),
};



export const adminBookingsApi = {
  list: ({ locationId = "", status = "", from = "", to = "" } = {}) => {
    const q = new URLSearchParams();
    if (locationId) q.set("locationId", locationId);
    if (status) q.set("status", status);
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const qs = q.toString();
    return api.get(`/bookings${qs ? `?${qs}` : ""}`);
  },
  cancel: (id) => api.patch(`/bookings/${id}/cancel`, {}),
};

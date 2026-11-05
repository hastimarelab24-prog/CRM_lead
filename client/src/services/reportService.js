
import api from "../api/api";

const toQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  return params.toString();
};

export const reportService = {
  // Get dashboard data
  async getDashboard(filters = {}) {
    const query = toQuery(filters);

    const response = await api.get(
      `/dashboard${query ? `?${query}` : ""}`
    );

    return response.data;
  },

  // Export leads CSV
  async exportLeads(filters = {}) {
    const query = toQuery(filters);

    const response = await api.get(
      `/dashboard/export-csv${query ? `?${query}` : ""}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },
};


import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leads';

export const leadService = {

fetchLeads: async (filters = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }
  

  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      limit:10,
      ...filters,
    }
  });

  console.log("GET /api/leads response:", response.data);

  return response.data;
},


  createLead: async (leadData) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.post(API_URL, leadData, config);
    return response.data;
  },

  updateLead: async (id, leadData) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}`, leadData, config);
    return response.data;
  },

  patchStatus: async (id, status) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.patch(`${API_URL}/${id}/status`, { status }, config);
    return response.data;
  },


deleteLead: async (id) => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_URL}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

};

import axios from "axios";

const api = axios.create({ baseURL: "https://rental-management-system-hh5a.onrender.com" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

// Dashboard
export const getDashboard = () => api.get("/dashboard");

// Properties
export const getProperties = () => api.get("/properties");
export const createProperty = (data) => api.post("/properties", data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);

// Units
export const getUnits = (propertyId) => api.get(`/properties/${propertyId}/units`);
export const createUnit = (propertyId, data) => api.post(`/properties/${propertyId}/units`, data);
export const updateUnit = (propertyId, unitId, data) => api.put(`/properties/${propertyId}/units/${unitId}`, data);
export const deleteUnit = (propertyId, unitId) => api.delete(`/properties/${propertyId}/units/${unitId}`);

// Tenants
export const getTenants = () => api.get("/tenants");
export const createTenant = (data) => api.post("/tenants", data);
export const updateTenant = (id, data) => api.put(`/tenants/${id}`, data);
export const deleteTenant = (id) => api.delete(`/tenants/${id}`);

// Leases
export const getLeases = () => api.get("/leases");
export const createLease = (data) => api.post("/leases", data);
export const updateLease = (id, data) => api.put(`/leases/${id}`, data);

// Payments
export const getPayments = (leaseId) => api.get(`/leases/${leaseId}/payments`);
export const createPayment = (leaseId, data) => api.post(`/leases/${leaseId}/payments`, data);

// Maintenance
export const getMaintenance = (status) => api.get("/maintenance", { params: status ? { status } : {} });
export const createMaintenance = (data) => api.post("/maintenance", data);
export const updateMaintenance = (id, data) => api.put(`/maintenance/${id}`, data);

// Expenses
export const getExpenses = (propertyId) => api.get(`/properties/${propertyId}/expenses`);
export const createExpense = (propertyId, data) => api.post(`/properties/${propertyId}/expenses`, data);

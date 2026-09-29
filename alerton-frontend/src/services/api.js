// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

export const requestOTP = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
  return response.data;
};

export const resetPassword = async (user_id, new_password) => {
  const response = await axios.post(`${API_URL}/reset-password`, { user_id, new_password });
  return response.data;
};

export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(`${API_URL}/users`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/current-user`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const getGroups = async () => {
  const response = await axios.get(`${API_URL}/groups`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const createGroup = async (groupData) => {
  const response = await axios.post(`${API_URL}/groups`, groupData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const updateGroup = async (groupId, groupData) => {
  const response = await axios.put(`${API_URL}/groups/${groupId}`, groupData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const deleteGroup = async (groupId) => {
  const response = await axios.delete(`${API_URL}/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const getAlerts = async () => {
  const response = await axios.get(`${API_URL}/alerts`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const createAlert = async (alertData) => {
  const response = await axios.post(`${API_URL}/alert`, alertData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const getServers = async () => {
  const response = await axios.get(`${API_URL}/servers`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const createServer = async (serverData) => {
  const response = await axios.post(`${API_URL}/servers`, serverData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const updateServer = async (serverId, serverData) => {
  const response = await axios.put(`${API_URL}/servers/${serverId}`, serverData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const deleteServer = async (serverId) => {
  const response = await axios.delete(`${API_URL}/servers/${serverId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const getCountries = async () => {
  const response = await axios.get(`${API_URL}/countries`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const getApplications = async () => {
  const response = await axios.get(`${API_URL}/applications`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const createApplication = async (appData) => {
  const response = await axios.post(`${API_URL}/applications`, appData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const updateApplication = async (appId, appData) => {
  const response = await axios.put(`${API_URL}/applications/${appId}`, appData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const deleteApplication = async (appId) => {
  const response = await axios.delete(`${API_URL}/applications/${appId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await axios.get(`${API_URL}/audit`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await axios.get(`${API_URL}/dashboard/summary`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data;
};

export const checkAdmin = async () => {
  const response = await axios.get(`${API_URL}/check-admin`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return response.data; // Returns { isAdmin: true } if successful
};
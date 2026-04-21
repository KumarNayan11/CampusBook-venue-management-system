import api from './api';

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.put(`/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

// Map createUser to auth/register as backend lacks POST /users
export const createUser = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  if (data.token) {
    localStorage.setItem('campusbook_token', data.token);
    localStorage.setItem('campusbook_user', JSON.stringify(data));
  }
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  if (data.token) {
    localStorage.setItem('campusbook_token', data.token);
    localStorage.setItem('campusbook_user', JSON.stringify(data));
  }
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await api.put('/auth/profile', userData);
  if (data.token) {
    localStorage.setItem('campusbook_token', data.token);
    const currentUser = JSON.parse(localStorage.getItem('campusbook_user') || '{}');
    localStorage.setItem('campusbook_user', JSON.stringify({ ...currentUser, ...data }));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('campusbook_token');
  localStorage.removeItem('campusbook_user');
  window.location.href = '/login';
};

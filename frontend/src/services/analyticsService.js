import api from './api';

export const getOverallAnalytics = async () => {
  const { data } = await api.get('/analytics/overall');
  return data;
};

export const getDepartmentAnalytics = async () => {
  const { data } = await api.get('/analytics/department');
  return data;
};

export const getPublicStats = async () => {
  const { data } = await api.get('/analytics/public');
  return data;
};

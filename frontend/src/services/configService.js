import api from './api';

export const getConfig = async () => {
  const { data } = await api.get('/config');
  return data;
};

export const updateConfig = async (configData) => {
  const { data } = await api.put('/config', configData);
  return data;
};

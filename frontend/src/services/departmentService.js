import api from './api';

export const getDepartments = async () => {
  const { data } = await api.get('/departments');
  return data;
};

export const createDepartment = async (deptData) => {
  const { data } = await api.post('/departments', deptData);
  return data;
};

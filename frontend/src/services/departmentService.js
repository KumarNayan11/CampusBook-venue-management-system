import api from './api';

export const getDepartments = async () => {
  const { data } = await api.get('/departments');
  return data;
};

export const createDepartment = async (deptData) => {
  const { data } = await api.post('/departments', deptData);
  return data;
};

export const updateDepartment = async (id, deptData) => {
  const { data } = await api.put(`/departments/${id}`, deptData);
  return data;
};

export const deleteDepartment = async (id) => {
  const { data } = await api.delete(`/departments/${id}`);
  return data;
};

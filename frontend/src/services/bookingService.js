import api from './api';

export const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData);
  return data;
};

export const getMyBookings = async () => {
  const { data } = await api.get('/bookings/my');
  return data;
};

export const getAllBookings = async (params = {}) => {
  const { data } = await api.get('/bookings/all', { params });
  return data;
};

export const hodApprove = async (id, comment) => {
  const { data } = await api.put(`/bookings/hod-approve/${id}`, { comment });
  return data;
};

export const dswApprove = async (id, comment) => {
  const { data } = await api.put(`/bookings/dsw-approve/${id}`, { comment });
  return data;
};

export const rejectBooking = async (id, reason) => {
  const { data } = await api.put(`/bookings/reject/${id}`, { reason });
  return data;
};

export const withdrawBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/withdraw`);
  return data;
};

export const deleteBooking = async (id) => {
  const { data } = await api.delete(`/bookings/${id}`);
  return data;
};

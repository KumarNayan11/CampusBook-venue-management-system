import api from './api';

export const getTimetable = async (venueId = null) => {
  const url = venueId ? `/timetable?venueId=${venueId}` : '/timetable';
  const { data } = await api.get(url);
  return data;
};

export const createTimetableEntry = async (entryData) => {
  const { data } = await api.post('/timetable', entryData);
  return data;
};

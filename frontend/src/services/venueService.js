import api from './api';

const VALID_VENUE_CATEGORIES = [
  'seminar_hall',
  'auditorium',
  'laboratory',
  'classroom',
  'conference_room',
  'sports_facility',
];

const normalizeVenuePayload = (venueData = {}) => ({
  ...venueData,
  category: VALID_VENUE_CATEGORIES.includes(venueData.category)
    ? venueData.category
    : 'sports_facility',
});

export const getVenues = async () => {
  const { data } = await api.get('/venues');
  return data;
};

export const createVenue = async (venueData) => {
  const { data } = await api.post('/venues', normalizeVenuePayload(venueData));
  return data;
};

export const updateVenue = async (id, venueData) => {
  const { data } = await api.put(`/venues/${id}`, normalizeVenuePayload(venueData));
  return data;
};

export const deleteVenue = async (id) => {
  const { data } = await api.delete(`/venues/${id}`);
  return data;
};

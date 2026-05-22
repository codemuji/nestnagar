import API from '../../../services/api';

export const getPersonalisedListings = async (params = {}) => {
  const response = await API.get('/listings/personalised', { params });
  return response.data;
};

export const getAllListings = async (params = {}) => {
  const response = await API.get('/listings', { params });
  return response.data;
};

export const getListingById = async (id) => {
  const response = await API.get(`/listings/${id}`);
  return response.data;
};

export const getMyListings = async () => {
  const response = await API.get('/listings/my');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await API.get('/listings/stats');
  return response.data;
};

export const createListing = async (formData) => {
  const response = await API.post('/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateListing = async (id, formData) => {
  const response = await API.patch(`/listings/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await API.delete(`/listings/${id}`);
  return response.data;
};

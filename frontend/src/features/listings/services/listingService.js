import API from '../../../services/api';

export const getPersonalisedListings = async () => {
  const response = await API.get('/listings/personalised');
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

export const createListing = async (formData) => {
  const response = await API.post('/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await API.delete(`/listings/${id}`);
  return response.data;
};

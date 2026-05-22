import API from '../../../services/api';

export const getPartnerCards = async (params = {}) => {
  const response = await API.get('/partners', { params });
  return response.data;
};

export const getPartnerCardById = async (id) => {
  const response = await API.get(`/partners/${id}`);
  return response.data;
};

export const createPartnerCard = async (formData) => {
  const response = await API.post('/partners', formData);
  return response.data;
};

export const updatePartnerCard = async (id, formData) => {
  const response = await API.patch(`/partners/${id}`, formData);
  return response.data;
};

export const deletePartnerCard = async (id) => {
  const response = await API.delete(`/partners/${id}`);
  return response.data;
};

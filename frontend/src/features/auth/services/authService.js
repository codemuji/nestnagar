import API from '../../../services/api';

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (phone, password) => {
  const response = await API.post('/auth/login', { phone, password });
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updateMe = async (userData) => {
  const response = await API.put('/auth/update-me', userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await API.post('/auth/logout');
  return response.data;
};

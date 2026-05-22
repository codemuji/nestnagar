import API from '../../../services/api';

export const startConversation = async (contextType, contextId, initialMessage = '') => {
  const response = await API.post('/chat', { contextType, contextId, initialMessage });
  return response.data;
};

export const getConversations = async () => {
  const response = await API.get('/chat');
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await API.get(`/chat/${conversationId}/messages`);
  return response.data;
};

export const markRead = async (conversationId) => {
  const response = await API.patch(`/chat/${conversationId}/read`);
  return response.data;
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../services/api';

// ===== LISTINGS QUERIES =====

export const usePersonalisedListings = (params = {}) => {
  return useQuery({
    queryKey: ['listings', 'personalised', params],
    queryFn: async () => {
      const response = await API.get('/listings/personalised', { params });
      return response.data;
    },
    enabled: !!params, // Only fetch when params exist
  });
};

export const useListingById = (id) => {
  return useQuery({
    queryKey: ['listings', id],
    queryFn: async () => {
      const response = await API.get(`/listings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAllListings = (params = {}) => {
  return useQuery({
    queryKey: ['listings', 'all', params],
    queryFn: async () => {
      const response = await API.get('/listings', { params });
      return response.data;
    },
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: ['listings', 'my'],
    queryFn: async () => {
      const response = await API.get('/listings/my');
      return response.data;
    },
  });
};

// ===== LISTINGS MUTATIONS =====

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const response = await API.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await API.patch(`/listings/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['listings', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await API.delete(`/listings/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['listings', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

// ===== CHAT QUERIES =====

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await API.get('/chat/conversations');
      return response.data;
    },
  });
};

export const useMessages = (conversationId) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await API.get(`/chat/messages/${conversationId}`);
      return response.data;
    },
    enabled: !!conversationId,
  });
};

// ===== CHAT MUTATIONS =====

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId) => {
      await API.post(`/chat/conversations/${conversationId}/read`);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, contextId, initialMessage }) => {
      const response = await API.post('/chat/conversations', { type, contextId, initialMessage });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
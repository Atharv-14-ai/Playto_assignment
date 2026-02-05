import apiClient from './client';

export const feedAPI = {
  // Posts
  getFeed: () => apiClient.get('/feed/'),
  getPosts: () => apiClient.get('/posts/'),
  getPost: (id) => apiClient.get(`/posts/${id}/`),
  createPost: (data) => apiClient.post('/posts/', data),
  updatePost: (id, data) => apiClient.put(`/posts/${id}/`, data),
  deletePost: (id) => apiClient.delete(`/posts/${id}/`),
  likePost: (id) => apiClient.post(`/posts/${id}/like/`),
  
  // Comments
  getComments: (params) => apiClient.get('/comments/', { params }),
  createComment: (data) => apiClient.post('/comments/', data),
  updateComment: (id, data) => apiClient.put(`/comments/${id}/`, data),
  deleteComment: (id) => apiClient.delete(`/comments/${id}/`),
  likeComment: (id) => apiClient.post(`/comments/${id}/like/`),
  
  // Leaderboard
  getLeaderboard: () => apiClient.get('/leaderboard/'),
};

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  register: (data) => apiClient.post('/auth/register/', data),
  logout: () => apiClient.post('/auth/logout/'),
  getCurrentUser: () => apiClient.get('/auth/user/'),
};

export default {
  feed: feedAPI,
  auth: authAPI,
};
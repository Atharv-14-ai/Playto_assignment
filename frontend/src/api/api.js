import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with credentials
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session auth
});

export const api = {
  async getFeed() {
    try {
      const response = await apiClient.get('/feed/');
      return response.data;
    } catch (error) {
      console.error('Error fetching feed:', error);
      return []; // Return empty array on error
    }
  },

  async getLeaderboard() {
    try {
      const response = await apiClient.get('/leaderboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return []; // Return empty array on error
    }
  },

  async likePost(postId) {
    try {
      // This requires authentication
      const response = await apiClient.post(`/posts/${postId}/like/`);
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  async likeComment(commentId) {
    try {
      const response = await apiClient.post(`/comments/${commentId}/like/`);
      return response.data;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }
};
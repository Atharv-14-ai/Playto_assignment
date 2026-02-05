import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import './App.css';

// API configuration - Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// CSRF token handling
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add CSRF token to requests
apiClient.interceptors.request.use((config) => {
  const csrftoken = getCookie('csrftoken');
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Memoized Login Modal Component
const LoginModal = memo(({ showLogin, onClose, onSwitchToRegister, loginForm, onLoginChange, onLoginSubmit }) => {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    if (showLogin && usernameRef.current) {
      usernameRef.current.focus();
    }
  }, [showLogin]);

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        showLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-transform duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              type="button"
            >
              &times;
            </button>
          </div>
          <form onSubmit={onLoginSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => onLoginChange('username', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  ref={passwordRef}
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => onLoginChange('password', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <button 
              onClick={onSwitchToRegister}
              className="text-blue-500 hover:text-blue-700"
              type="button"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized Register Modal Component
const RegisterModal = memo(({ showRegister, onClose, onSwitchToLogin, registerForm, onRegisterChange, onRegisterSubmit }) => {
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const password2Ref = useRef(null);

  useEffect(() => {
    if (showRegister && usernameRef.current) {
      usernameRef.current.focus();
    }
  }, [showRegister]);

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        showRegister ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-transform duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sign Up</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              type="button"
            >
              &times;
            </button>
          </div>
          <form onSubmit={onRegisterSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => onRegisterChange('username', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => onRegisterChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  ref={passwordRef}
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => onRegisterChange('password', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  ref={password2Ref}
                  type="password"
                  value={registerForm.password2}
                  onChange={(e) => onRegisterChange('password2', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Account
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <button 
              onClick={onSwitchToLogin}
              className="text-blue-500 hover:text-blue-700"
              type="button"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized Comment Component
const CommentItem = memo(({ comment, depth = 0, onCommentLike, onReply, auth, replyTexts, onReplyChange, onReplySubmit }) => {
  const [showReply, setShowReply] = useState(false);
  const replyText = replyTexts[comment.id] || '';
  
  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''} my-3`}>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {comment.author?.username?.charAt(0) || 'U'}
            </div>
            <div>
              <span className="font-medium text-gray-800">{comment.author?.username || 'Unknown'}</span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(comment.created_at).toLocaleDateString()}
                {comment.author?.profile?.total_karma !== undefined && (
                  <span className="ml-1 text-green-600">• {comment.author.profile.total_karma} karma</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onCommentLike(comment.id)}
              className={`flex items-center space-x-1 ${comment.has_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <span>❤️</span>
              <span className="text-sm">{comment.like_count || 0}</span>
            </button>
            {depth < 3 && auth && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-blue-500 hover:text-blue-700 text-sm"
                type="button"
              >
                Reply
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-700 mb-2">{comment.content}</p>
        
        {showReply && (
          <div className="mt-3">
            <textarea
              value={replyText}
              onChange={(e) => onReplyChange(comment.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Write a reply..."
              rows="2"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowReply(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (replyText.trim()) {
                    onReplySubmit(comment.post, replyText, comment.id);
                    setShowReply(false);
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                type="button"
              >
                Post Reply
              </button>
            </div>
          </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                depth={depth + 1}
                onCommentLike={onCommentLike}
                onReply={onReply}
                auth={auth}
                replyTexts={replyTexts}
                onReplyChange={onReplyChange}
                onReplySubmit={onReplySubmit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Main App Component
function App() {
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    showLogin: false,
    showRegister: false,
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [commentTexts, setCommentTexts] = useState({});
  const [replyTexts, setReplyTexts] = useState({});

  // Memoized callbacks to prevent unnecessary re-renders
  const handleLoginChange = useCallback((field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleRegisterChange = useCallback((field, value) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCloseLogin = useCallback(() => {
    setAuth(prev => ({ ...prev, showLogin: false }));
  }, []);

  const handleCloseRegister = useCallback(() => {
    setAuth(prev => ({ ...prev, showRegister: false }));
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    setAuth(prev => ({ ...prev, showLogin: false, showRegister: true }));
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setAuth(prev => ({ ...prev, showRegister: false, showLogin: true }));
  }, []);

  useEffect(() => {
    loadData();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiClient.get('/auth/user/');
      setAuth({
        ...auth,
        isAuthenticated: true,
        user: response.data
      });
    } catch (error) {
      console.log('Not authenticated');
    }
  };

  const loadData = async () => {
    try {
      const [feedData, leaderboardData] = await Promise.all([
        apiClient.get('/feed/'),
        apiClient.get('/leaderboard/')
      ]);
      setPosts(feedData.data);
      setLeaderboard(leaderboardData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      setPosts([]);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/auth/login/', loginForm);
      setAuth({
        ...auth,
        isAuthenticated: true,
        user: response.data.user,
        showLogin: false,
        showRegister: false,
      });
      setLoginForm({ username: '', password: '' });
      loadData();
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || 'Invalid credentials'));
    }
  }, [loginForm, auth]);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.password2) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await apiClient.post('/auth/register/', {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        password2: registerForm.password2
      });
      setAuth({
        isAuthenticated: true,
        user: response.data.user,
        showLogin: false,
        showRegister: false,
      });
      setRegisterForm({ username: '', email: '', password: '', password2: '' });
      loadData();
    } catch (error) {
      const errors = error.response?.data;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join(', ');
        alert('Registration failed: ' + errorMessages);
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  }, [registerForm]);

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout/');
      setAuth({
        isAuthenticated: false,
        user: null,
        showLogin: false,
        showRegister: false,
      });
      setPosts([]);
      setLeaderboard([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const handleLike = useCallback(async (postId) => {
    if (!auth.isAuthenticated) {
      setAuth(prev => ({ ...prev, showLogin: true }));
      return;
    }
    
    try {
      await apiClient.post(`/posts/${postId}/like/`);
      loadData();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  }, [auth.isAuthenticated]);

  const handleCommentLike = useCallback(async (commentId) => {
    if (!auth.isAuthenticated) {
      setAuth(prev => ({ ...prev, showLogin: true }));
      return;
    }
    
    try {
      await apiClient.post(`/comments/${commentId}/like/`);
      loadData();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }, [auth.isAuthenticated]);

  const handleSubmitPost = useCallback(async (e) => {
    e.preventDefault();
    if (!newPost.trim()) {
      alert('Post cannot be empty');
      return;
    }
    
    if (!auth.isAuthenticated) {
      setAuth(prev => ({ ...prev, showLogin: true }));
      return;
    }
    
    try {
      await apiClient.post('/posts/', { content: newPost });
      setNewPost('');
      loadData();
    } catch (error) {
      alert('Failed to create post');
    }
  }, [newPost, auth.isAuthenticated]);

  const handleSubmitComment = useCallback(async (postId, content, parentId = null) => {
    if (!auth.isAuthenticated) {
      setAuth(prev => ({ ...prev, showLogin: true }));
      return;
    }
    
    try {
      await apiClient.post('/comments/', {
        post: postId,
        content: content,
        parent: parentId
      });
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      if (parentId) {
        setReplyTexts(prev => ({ ...prev, [parentId]: '' }));
      }
      loadData();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  }, [auth.isAuthenticated]);

  const handleCommentChange = useCallback((postId, value) => {
    setCommentTexts(prev => ({ ...prev, [postId]: value }));
  }, []);

  const handleReplyChange = useCallback((commentId, value) => {
    setReplyTexts(prev => ({ ...prev, [commentId]: value }));
  }, []);

  const handleShowLogin = useCallback(() => {
    setAuth(prev => ({ ...prev, showLogin: true }));
  }, []);

  const handleShowRegister = useCallback(() => {
    setAuth(prev => ({ ...prev, showRegister: true }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Memoized Modals */}
      <LoginModal
        showLogin={auth.showLogin}
        onClose={handleCloseLogin}
        onSwitchToRegister={handleSwitchToRegister}
        loginForm={loginForm}
        onLoginChange={handleLoginChange}
        onLoginSubmit={handleLogin}
      />
      
      <RegisterModal
        showRegister={auth.showRegister}
        onClose={handleCloseRegister}
        onSwitchToLogin={handleSwitchToLogin}
        registerForm={registerForm}
        onRegisterChange={handleRegisterChange}
        onRegisterSubmit={handleRegister}
      />

      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-gray-800">Playto Community</h1>
            </div>
            
            {auth.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {auth.user?.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-medium">{auth.user?.username || 'User'}</div>
                    <div className="text-sm text-gray-500">
                      {auth.user?.profile?.total_karma || 0} karma
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  type="button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleShowLogin}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                  type="button"
                >
                  Login
                </button>
                <button 
                  onClick={handleShowRegister}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {auth.isAuthenticated && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Create a Post</h2>
                <form onSubmit={handleSubmitPost}>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What's on your mind? Share with the community..."
                    maxLength={5000}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      {newPost.length}/5000 characters
                      <span className="ml-2 text-green-600 font-medium">+5 karma per like</span>
                    </span>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Post
                    </button>
                  </div>
                </form>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Community Feed</h2>
            
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Playto Community!</h3>
                <p className="text-gray-600 mb-6">
                  {auth.isAuthenticated 
                    ? 'Be the first to share something with the community!' 
                    : 'Sign in to create the first post and start earning karma!'}
                </p>
                {!auth.isAuthenticated && (
                  <button 
                    onClick={handleShowLogin}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    type="button"
                  >
                    Sign In to Get Started
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  const commentText = commentTexts[post.id] || '';
                  return (
                    <div key={post.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {post.author?.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{post.author?.username || 'Unknown'}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleString()}
                              {post.author?.profile?.total_karma !== undefined && (
                                <span className="ml-2 text-green-600 font-medium">
                                  • {post.author.profile.total_karma} karma
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-800 mb-6 whitespace-pre-wrap">{post.content}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 ${post.has_liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'} transition-colors`}
                          disabled={!auth.isAuthenticated}
                          type="button"
                        >
                          <span className="text-xl">❤️</span>
                          <span>{post.like_count || 0} likes</span>
                        </button>
                        <div className="text-gray-600">
                          <span className="text-xl">💬</span>
                          <span className="ml-2">{post.comment_count || 0} comments</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-4">Comments</h4>
                        
                        {auth.isAuthenticated && (
                          <div className="mb-6">
                            <textarea
                              value={commentText}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Add a comment..."
                              rows="3"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => {
                                  if (commentText.trim()) {
                                    handleSubmitComment(post.id, commentText);
                                  }
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                type="button"
                              >
                                Post Comment
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                              <CommentItem 
                                key={comment.id} 
                                comment={comment}
                                onCommentLike={handleCommentLike}
                                onReply={handleSubmitComment}
                                auth={auth.isAuthenticated}
                                replyTexts={replyTexts}
                                onReplyChange={handleReplyChange}
                                onReplySubmit={handleSubmitComment}
                              />
                            ))
                          ) : (
                            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2 text-yellow-500">🏆</span>
                  24-Hour Leaderboard
                </h2>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Live
                </span>
              </div>
              
              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  leaderboard.map((user, index) => (
                    <div
                      key={user.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' :
                        index === 1 ? 'bg-gray-50 border border-gray-200' :
                        index === 2 ? 'bg-amber-50 border border-amber-200' :
                        'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{user.username}</div>
                          <div className="text-xs text-gray-500">
                            {user.post_likes_24h || 0} post likes • {user.comment_likes_24h || 0} comment likes
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800">{user.daily_karma || 0}</div>
                        <div className="text-xs text-gray-500">karma</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gray-100 rounded-full">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <p className="font-medium mb-1">No recent activity</p>
                    <p className="text-sm">Be the first to earn karma!</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">How Karma Works</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">+5</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Post Likes</div>
                      <div className="text-sm text-gray-600">Each like on your post gives 5 karma</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">+1</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Comment Likes</div>
                      <div className="text-sm text-gray-600">Each like on your comment gives 1 karma</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
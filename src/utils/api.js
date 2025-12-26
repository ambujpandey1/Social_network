import axios from "axios";

// API base URL - points to Django backend
const API_BASE_URL = "http://127.0.0.1:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh or logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ENDPOINTS ====================

export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - {email, first_name, last_name, date_of_birth, password, password2, profile_picture}
   * @returns {Promise} User data and success message
   */
  // signup: (userData) => {
  //   const formData = new FormData();
  //   formData.append("email", userData.email);
  //   formData.append("first_name", userData.first_name);
  //   formData.append("last_name", userData.last_name);
  //   formData.append("date_of_birth", userData.date_of_birth);
  //   formData.append("password", userData.password);
  //   formData.append("password2", userData.password2);
  //   if (userData.profile_picture) {
  //     formData.append("profile_picture", userData.profile_picture);
  //   }
  //   return api.post("/accounts/signup/", formData, {
  //     headers: { "Content-Type": "multipart/form-data" },
  //   });
  // },
signup: (userData) =>
  api.post("/accounts/signup/", {
    email: userData.email,
    username: userData.username,   // ✅ REQUIRED
    first_name: userData.first_name,
    last_name: userData.last_name,
    date_of_birth: userData.date_of_birth,
    password: userData.password,
    password2: userData.password2,
  }),

  /**
   * Login user and get JWT tokens
   * @param {Object} credentials - {email, password}
   * @returns {Promise} JWT tokens and user data
   */
  login: (credentials) => api.post("/accounts/login/", credentials),

  /**
   * Get current user's profile
   * @returns {Promise} User profile data
   */
  getProfile: () => api.get("/accounts/profile/"),

  /**
   * Update user profile
   * @param {Object} profileData - Updated user information
   * @returns {Promise} Updated user data
   */
  updateProfile: (profileData) => {
    const formData = new FormData();
    if (profileData.first_name)
      formData.append("first_name", profileData.first_name);
    if (profileData.last_name)
      formData.append("last_name", profileData.last_name);
    if (profileData.date_of_birth)
      formData.append("date_of_birth", profileData.date_of_birth);
    if (profileData.bio) formData.append("bio", profileData.bio);
    if (profileData.profile_picture)
      formData.append("profile_picture", profileData.profile_picture);

    return api.patch("/accounts/profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ==================== POST ENDPOINTS ====================

export const postsAPI = {
  /**
   * Get all posts
   * @returns {Promise} List of all posts
   */
  getPosts: () => api.get("/posts/"),

  /**
   * Get single post details
   * @param {number} postId - Post ID
   * @returns {Promise} Post details
   */
  getPost: (postId) => api.get(`/posts/${postId}/`),

  /**
   * Create a new post
   * @param {Object} postData - {description, image}
   * @returns {Promise} Created post data
   */
  createPost: (postData) => {
    const formData = new FormData();
    formData.append("description", postData.description);
    if (postData.image) {
      formData.append("image", postData.image);
    }
    return api.post("/posts/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Delete a post
   * @param {number} postId - Post ID
   * @returns {Promise} Success message
   */
  deletePost: (postId) => api.delete(`/posts/${postId}/`),

  /**
   * Like a post
   * @param {number} postId - Post ID
   * @returns {Promise} Updated like count
   */
  likePost: (postId) => api.post(`/posts/${postId}/like/`),

  /**
   * Remove like from post
   * @param {number} postId - Post ID
   * @returns {Promise} Updated like count
   */
  removeLike: (postId) => api.delete(`/posts/${postId}/like/`),

  /**
   * Dislike a post
   * @param {number} postId - Post ID
   * @returns {Promise} Updated dislike count
   */
  dislikePost: (postId) => api.post(`/posts/${postId}/dislike/`),

  /**
   * Remove dislike from post
   * @param {number} postId - Post ID
   * @returns {Promise} Updated dislike count
   */
  removeDislike: (postId) => api.delete(`/posts/${postId}/dislike/`),
};

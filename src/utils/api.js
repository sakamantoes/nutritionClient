// src/utils/api.js
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:3000/api";
const PYTHON_API_URL = "http://localhost:5000/api";

// Node.js API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Python Flask API instance
const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for Node.js API
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    const message = error.response?.data?.error || error.message || "Something went wrong";
    
    // Don't show toast for auth errors
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// Response interceptor for Python API
pythonApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Python API Error:', error);
    const message = error.response?.data?.error || error.message || "ML service unavailable";
    if (error.response?.status !== 401) toast.error(message);
    return Promise.reject(error);
  }
);

// Auth API (Node.js)
export const authApi = {
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/profile/${userId}`, data),
  getDailySummary: (userId, date) =>
    api.get(`/users/summary/${userId}`, { params: { date } }),
};

// Food API (Node.js) - FIXED VERSION
export const foodApi = {
  logFood: (data) => {
    console.log('Logging food:', data);
    return api.post('/foods/log', data);
  },
  
  getFoodHistory: (userId, params = {}) => {
    console.log('Fetching food history for user:', userId, 'Params:', params);
    return api.get(`/foods/history/${userId}`, { 
      params,
      // Add timestamp to prevent caching issues
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).then(response => {
      console.log('Food history response:', response.data);
      
      // Ensure consistent data structure
      const data = response.data;
      
      // If response is just an array, wrap it in proper structure
      if (Array.isArray(data)) {
        return {
          foodLogs: data,
          count: data.length,
          success: true
        };
      }
      
      // If response has foodLogs property, ensure it's an array
      if (data && data.foodLogs && !Array.isArray(data.foodLogs)) {
        data.foodLogs = [];
      }
      
      // If no foodLogs property, create it
      if (!data.foodLogs) {
        data.foodLogs = [];
      }
      
      // Ensure count is set
      if (!data.count && Array.isArray(data.foodLogs)) {
        data.count = data.foodLogs.length;
      }
      
      return data;
    }).catch(error => {
      console.error('Food history API error:', error);
      // Return empty structure on error to prevent UI breakage
      return {
        foodLogs: [],
        count: 0,
        error: error.message
      };
    });
  },
  
  searchFoods: (query) => {
    console.log('Searching foods with query:', query);
    return api.get('/foods/search', { 
      params: { query },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => {
      console.log('Search API response:', response.data);
      return response;
    }).catch(error => {
      console.error('Search API error:', error);
      throw error;
    });
  },
  
  getNutritionDataset: (params) => 
    api.get('/foods/dataset', { params }),
  
  deleteFoodLog: (logId) => {
    console.log('Deleting food log:', logId);
    return api.delete(`/foods/log/${logId}`);
  },
};

// Exercise API (Node.js)
export const exerciseApi = {
  logExercise: (data) => api.post('/exercises/log', data),
  getRecommendations: (userId) => 
    api.get(`/exercises/recommendations/${userId}`),
  getExerciseHistory: (userId, params) => 
    api.get(`/exercises/history/${userId}`, { params }),
  deleteExercise: (exerciseId) => api.delete(`/exercises/${exerciseId}`),
  updateExercise: (exerciseId, data) => api.put(`/exercises/${exerciseId}`, data),
};

// Chatbot API (Node.js)
export const chatbotApi = {
  sendMessage: (data) => api.post("/chatbot/message", data),
};

// Machine Learning API (Python Flask)
export const mlApi = {
  predictFoodGroup: (nutritionData) => 
    pythonApi.post("/predict/food-group", nutritionData),
  
  predictHealthScore: (nutritionData) => 
    pythonApi.post("/predict/health-score", nutritionData),
  
  getExerciseRecommendations: (userData) => 
    pythonApi.post("/exercise/recommend", userData),
  
  analyzeNutrition: (mealData) => 
    pythonApi.post("/nutrition/analyze", mealData),
  
  chatbotResponse: (messageData) => 
    pythonApi.post("/chatbot/response", messageData),
  
  getNutritionInsights: (userData) => 
    pythonApi.post("/insights/nutrition", userData),
  
  generateMealPlan: (userPreferences) => 
    pythonApi.post("/meal-plan/generate", userPreferences),
  
  analyzeFoodImage: (imageData) => 
    pythonApi.post("/analyze/image", imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default api;
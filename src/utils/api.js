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
});

// Python Flask API instance
const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth interceptor for Node.js API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for Node.js API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || "Something went wrong";
    if (error.response?.status !== 401) toast.error(message);
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

  getWeeklyNutrition: (userId, weeks) => 
    api.get(`/users/nutrition/weekly/${userId}`, { params: { weeks } }),
};

// Food API (Node.js)
export const foodApi = {
    logFood: (data) => api.post('/foods/log', data),
  getFoodHistory: (userId, params) => 
    api.get(`/foods/history/${userId}`, { params })
    .then(response => {
      // Ensure consistent response format
      if (Array.isArray(response.data)) {
        return {
          foodLogs: response.data,
          count: response.data.length
        };
      }
      return response.data;
    }),
  getNutritionDataset: (params) =>
    api.get("/foods/dataset", { params }),
  deleteFoodLog: (logId) => api.delete(`/foods/log/${logId}`),
};

// src/utils/api.js - Add to exerciseApi object
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
  // Predict food group from nutrition data
  predictFoodGroup: (nutritionData) => 
    pythonApi.post("/predict/food-group", nutritionData),
  
  // Predict health score from nutrition data
  predictHealthScore: (nutritionData) => 
    pythonApi.post("/predict/health-score", nutritionData),
  
  // Get AI exercise recommendations
  getExerciseRecommendations: (userData) => 
    pythonApi.post("/exercise/recommend", userData),
  
  // Analyze nutrition data
  analyzeNutrition: (mealData) => 
    pythonApi.post("/nutrition/analyze", mealData),
  
  // Get chatbot response from Python AI
  chatbotResponse: (messageData) => 
    pythonApi.post("/chatbot/response", messageData),
  
  // Get nutrition insights and recommendations
  getNutritionInsights: (userData) => 
    pythonApi.post("/insights/nutrition", userData),
  
  // Generate meal plan
  generateMealPlan: (userPreferences) => 
    pythonApi.post("/meal-plan/generate", userPreferences),
  
  // Analyze food image (if you have image recognition)
  analyzeFoodImage: (imageData) => 
    pythonApi.post("/analyze/image", imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default api;
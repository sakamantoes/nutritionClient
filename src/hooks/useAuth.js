// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { authApi } from "../utils/api";
import toast from "react-hot-toast";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } else {
        // Fetch user from backend
        authApi.getProfile('me') // assuming your backend supports /users/profile/me
          .then(res => {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { user } = response.data;

      localStorage.setItem("token", response.data.token || "dummy-token");
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast.success("Login successful!");
      return user;
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      const { user } = response.data;

      localStorage.setItem("token", response.data.token || "dummy-token");
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
      return { success: false, error };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (userId, updates) => {
    try {
      const response = await authApi.updateProfile(userId, updates);
      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || "Update failed");
      return { success: false, error };
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };
};

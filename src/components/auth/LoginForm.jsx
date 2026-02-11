// src/components/auth/LoginForm.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import Input from "../common/Input";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle normal form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard"); // ✅ Navigate after successful login
    } catch {
      setErrors({ submit: "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  // Handle demo login
  const handleDemoLogin = async () => {
    setFormData({ email: "demo@example.com", password: "demo123" });
    setLoading(true);

    try {
      await login("demo@example.com", "demo123");
      navigate("/dashboard"); // ✅ Navigate after demo login
    } catch {
      setErrors({ submit: "Demo login failed" });
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submit error */}
      {errors.submit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 rounded-lg"
        >
          <p className="text-sm text-danger-600 dark:text-danger-400">{errors.submit}</p>
        </motion.div>
      )}

      {/* Email input */}
      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        error={errors.email}
        leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
        placeholder="you@example.com"
        required
      />

      {/* Password input */}
      <div>
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          placeholder="Enter your password"
          required
        />
        <div className="flex justify-end mt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        loading={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
      >
        <LogIn className="h-5 w-5 mr-2" />
        Sign In
      </Button>

      {/* Demo login */}
      <Button type="button" variant="outline" onClick={handleDemoLogin} className="w-full">
        Try Demo Account
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      

      {/* Sign up */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Scale,
  Ruler,
  Target,
  Activity,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import Input from "../common/Input";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: 30,
    weight: 70,
    height: 170,
    goal: "maintain",
    activity_level: "moderate",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const goals = [
    { id: "lose", label: "Weight Loss", icon: "📉" },
    { id: "maintain", label: "Maintain", icon: "⚖️" },
    { id: "gain", label: "Weight Gain", icon: "📈" },
  ];

  const activityLevels = [
    {
      id: "sedentary",
      label: "Sedentary",
      description: "Little or no exercise",
    },
    {
      id: "light",
      label: "Light",
      description: "Light exercise 1-3 days/week",
    },
    {
      id: "moderate",
      label: "Moderate",
      description: "Moderate exercise 3-5 days/week",
    },
    {
      id: "active",
      label: "Active",
      description: "Hard exercise 6-7 days/week",
    },
    {
      id: "very_active",
      label: "Very Active",
      description: "Very hard exercise & physical job",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.age < 1 || formData.age > 120) {
      newErrors.age = "Age must be between 1 and 120";
    }

    if (formData.weight < 20 || formData.weight > 300) {
      newErrors.weight = "Weight must be between 20 and 300 kg";
    }

    if (formData.height < 100 || formData.height > 250) {
      newErrors.height = "Height must be between 100 and 250 cm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registrationData } = formData;

      const result = await register(registrationData);

      // ✅ Redirect if successful
      if (result.success) {
        navigate("/login");
      }
    } catch (error) {
      setErrors({ submit: error.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleStep = (step) => {
    // In a real app, you might want to implement multi-step form
    console.log("Step:", step);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 rounded-lg"
        >
          <p className="text-sm text-danger-600 dark:text-danger-400">
            {errors.submit}
          </p>
        </motion.div>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              leftIcon={<User className="h-5 w-5 text-indigo-400" />}
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="h-5 w-5 text-indigo-400" />}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="h-5 w-5 text-indigo-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
              placeholder="Create password"
              required
            />
          </div>
          <div>
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<Lock className="h-5 w-5 text-indigo-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
              placeholder="Confirm password"
              required
            />
          </div>
        </div>
      </div>

      {/* Health Profile */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Health Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => handleChange("age", parseInt(e.target.value))}
              error={errors.age}
              leftIcon={<Calendar className="h-5 w-5 text-indigo-400" />}
              min="1"
              max="120"
              required
            />
          </div>
          <div>
            <Input
              label="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) =>
                handleChange("weight", parseFloat(e.target.value))
              }
              error={errors.weight}
              leftIcon={<Scale className="h-5 w-5 text-indigo-400" />}
              min="20"
              max="300"
              step="0.1"
              required
            />
          </div>
          <div>
            <Input
              label="Height (cm)"
              type="number"
              value={formData.height}
              onChange={(e) => handleChange("height", parseInt(e.target.value))}
              error={errors.height}
              leftIcon={<Ruler className="h-5 w-5 text-indigo-400" />}
              min="100"
              max="250"
              required
            />
          </div>
        </div>

        {/* Fitness Goal */}
        <div>
          <label className="label flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Fitness Goal
          </label>
          <div className="grid grid-cols-3 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleChange("goal", goal.id)}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  formData.goal === goal.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="text-2xl mb-1">{goal.icon}</div>
                <span className="text-sm font-medium">{goal.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="label flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Activity Level
          </label>
          <select
            value={formData.activity_level}
            onChange={(e) => handleChange("activity_level", e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
          >
            {activityLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label} - {level.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
      >
        <UserPlus className="h-5 w-5 mr-2" />
        Create Account
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-indigo-400">
            Already have an account?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          Sign in to existing account
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;

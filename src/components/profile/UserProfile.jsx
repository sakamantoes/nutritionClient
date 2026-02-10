// src/components/profile/UserProfile.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar,
  Scale,
  Ruler,
  Target,
  Activity,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import ProgressCircle from '../common/ProgressCircle';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || 30,
    weight: user?.weight || 70,
    height: user?.height || 170,
    goal: user?.goal || 'maintain',
    activity_level: user?.activity_level || 'moderate',
  });

  const goals = [
    { id: 'lose', label: 'Weight Loss', color: 'success' },
    { id: 'maintain', label: 'Maintain Weight', color: 'primary' },
    { id: 'gain', label: 'Weight Gain', color: 'warning' },
  ];

  const activityLevels = [
    { id: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
    { id: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { id: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
    { id: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
    { id: 'very_active', label: 'Extra Active', description: 'Very hard exercise & physical job' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const calculateBMI = () => {
    const heightInMeters = formData.height / 100;
    return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'warning' };
    if (bmi < 25) return { label: 'Normal', color: 'success' };
    if (bmi < 30) return { label: 'Overweight', color: 'warning' };
    return { label: 'Obese', color: 'danger' };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="space-y-6 ">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 ">
            <div className="h-20 w-20 rounded-full bg-indigo-400 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || <User className="h-10 w-10 text-indigo-500" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="text-2xl font-bold"
                  />
                ) : (
                  user?.name
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                    className="mt-1"
                  />
                ) : (
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {user?.email}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div>
            {isEditing ? (
              <div className="flex items-center space-x-2 ">
                <Button
                
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      age: user?.age || 30,
                      weight: user?.weight || 70,
                      height: user?.height || 170,
                      goal: user?.goal || 'maintain',
                      activity_level: user?.activity_level || 'moderate',
                    });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className='bg-green-500'>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} className='bg-indigo-500'>
                <Edit2 className="h-4 w-4 mr-2 " />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* BMI */}
        <Card className="p-6">
          <div className="text-center">
            <ProgressCircle
              value={(bmi / 40) * 100}
              size={100}
              color={bmiCategory.color}
              label="BMI"
            />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              {bmi}
            </h3>
            <p className={`text-sm font-medium text-${bmiCategory.color}-600 dark:text-${bmiCategory.color}-400`}>
              {bmiCategory.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Body Mass Index
            </p>
          </div>
        </Card>

        {/* Weight Goal */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Weight Goal</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.goal || 'maintain'}
              </p>
            </div>
          </div>
          {isEditing ? (
            <select
              value={formData.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              className="w-full input"
            >
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-2 rounded-lg ${
                    user?.goal === goal.id
                      ? `bg-${goal.color}-100 dark:bg-${goal.color}-900/30 border border-${goal.color}-500`
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <p className={`text-sm font-medium ${
                    user?.goal === goal.id
                      ? `text-${goal.color}-600 dark:text-${goal.color}-400`
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {goal.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Daily Calories */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
              <Activity className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Daily Calories</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user?.daily_calorie_goal || 2000}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Based on your profile
          </p>
        </Card>

        {/* Activity Level */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30">
              <Activity className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Activity Level</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.activity_level || 'moderate'}
              </p>
            </div>
          </div>
          {isEditing ? (
            <select
              value={formData.activity_level}
              onChange={(e) => handleChange('activity_level', e.target.value)}
              className="w-full input"
            >
              {activityLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              {activityLevels.map((level) => (
                <div
                  key={level.id}
                  className={`p-2 rounded-lg text-sm ${
                    user?.activity_level === level.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <p className="font-medium">{level.label}</p>
                  <p className="text-xs opacity-75">{level.description}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Personal Details */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Age */}
          <div>
            <label className="label flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Age
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
                min="1"
                max="120"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.age} years
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="label flex items-center">
              <Scale className="h-4 w-4 mr-2" />
              Weight
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                min="20"
                max="300"
                step="0.1"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.weight} kg
              </p>
            )}
          </div>

          {/* Height */}
          <div>
            <label className="label flex items-center">
              <Ruler className="h-4 w-4 mr-2" />
              Height
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => handleChange('height', parseInt(e.target.value))}
                min="100"
                max="250"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.height} cm
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
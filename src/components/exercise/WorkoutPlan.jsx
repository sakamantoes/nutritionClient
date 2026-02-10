// src/components/exercise/WorkoutPlan.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle,
  PlayCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const WorkoutPlan = ({ recommendations }) => {
  // Handle different response formats from backend
  const getRecommendationsData = () => {
    if (!recommendations) return null;
    
    // Case 1: Direct response with exercises array
    if (Array.isArray(recommendations)) {
      return {
        exercises: recommendations,
        userGoal: 'maintain',
        calorieBalance: 0,
        tips: []
      };
    }
    
    // Case 2: Response with data property (from API)
    if (recommendations.data) {
      const data = recommendations.data;
      return {
        exercises: data.exercises || data.recommendations || [],
        userGoal: data.userGoal || data.goal || 'maintain',
        calorieBalance: data.calorieBalance || data.calories_balance || 0,
        tips: data.tips || []
      };
    }
    
    // Case 3: Response as object
    if (typeof recommendations === 'object') {
      return {
        exercises: recommendations.exercises || recommendations.recommendations || [],
        userGoal: recommendations.userGoal || recommendations.goal || 'maintain',
        calorieBalance: recommendations.calorieBalance || recommendations.calories_balance || 0,
        tips: recommendations.tips || []
      };
    }
    
    return null;
  };

  const data = getRecommendationsData();

  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const { exercises = [], userGoal = 'maintain', calorieBalance = 0, tips = [] } = data;

  // Ensure exercises is an array and has the expected structure
  const formattedExercises = Array.isArray(exercises) ? exercises : [];
  
  // Default tips if none provided
  const defaultTips = [
    'Aim for at least 150 minutes of moderate exercise per week',
    'Include strength training 2-3 times per week',
    'Stay hydrated during workouts',
    'Allow for rest days to prevent injury'
  ];

  const displayTips = tips.length > 0 ? tips : defaultTips;

  // Generate fallback exercises if none provided
  const getFallbackExercises = () => {
    if (formattedExercises.length > 0) return formattedExercises;
    
    const goalExercises = {
      lose: [
        { name: 'High-Intensity Interval Training (HIIT)', duration: 30, calories: 350, type: 'cardio' },
        { name: 'Running', duration: 45, calories: 450, type: 'cardio' },
        { name: 'Cycling', duration: 60, calories: 500, type: 'cardio' }
      ],
      gain: [
        { name: 'Weight Lifting', duration: 60, calories: 250, type: 'strength' },
        { name: 'Bodyweight Training', duration: 45, calories: 200, type: 'strength' },
        { name: 'Light Cardio', duration: 20, calories: 100, type: 'cardio' }
      ],
      maintain: [
        { name: 'Mixed Workout', duration: 45, calories: 300, type: 'mixed' },
        { name: 'Yoga', duration: 60, calories: 180, type: 'flexibility' },
        { name: 'Swimming', duration: 45, calories: 350, type: 'cardio' }
      ]
    };
    
    return goalExercises[userGoal] || goalExercises.maintain;
  };

  const displayExercises = getFallbackExercises();

  // Get goal-specific message
  const getGoalMessage = () => {
    const messages = {
      lose: 'Focus on cardio to create a calorie deficit for weight loss.',
      gain: 'Prioritize strength training to support muscle growth.',
      maintain: 'Balance cardio and strength training to maintain your current weight.'
    };
    return messages[userGoal] || messages.maintain;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Personalized Workout Plan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based on your {userGoal.replace('_', ' ')} goal
          </p>
        </div>
        <Target className="h-6 w-6 text-primary-500" />
      </div>

      {/* Goal Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              Daily Status
            </span>
          </div>
          <span className={`text-sm font-bold ${
            calorieBalance > 0 ? 'text-danger' : calorieBalance < 0 ? 'text-success' : 'text-gray-600'
          }`}>
            {calorieBalance > 0 ? `+${calorieBalance}` : calorieBalance} cal
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getGoalMessage()}
        </p>
      </div>

      {/* Recommended Exercises */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended Exercises
          </h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {displayExercises.length} exercises
          </span>
        </div>
        {displayExercises.map((exercise, index) => (
          <motion.div
            key={exercise.name || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {exercise.name || `Exercise ${index + 1}`}
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {exercise.duration || 30} min
                  </span>
                  <span>•</span>
                  <span className="capitalize">{exercise.type || 'cardio'}</span>
                  {exercise.description && (
                    <>
                      <span>•</span>
                      <span className="text-xs">{exercise.description}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                {exercise.calories || exercise.caloriesBurned || 200} cal
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Estimated burn
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Expert Tips
          </h4>
          <CheckCircle className="h-5 w-5 text-success" />
        </div>
        <div className="space-y-2">
          {displayTips.map((tip, index) => (
            <motion.div
              key={tip || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-2"
            >
              <div className="h-2 w-2 rounded-full bg-success mt-1.5 flex-shrink-0"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tip}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // Handle schedule action
            alert('Schedule feature coming soon!');
          }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
        <Button 
          size="sm"
          onClick={() => {
            // Handle start workout action
            alert('Starting your workout!');
          }}
        >
          Start Workout
        </Button>
      </div>
    </Card>
  );
};

export default WorkoutPlan;
// src/components/exercise/WorkoutPlan.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle,
  PlayCircle,
  Calendar
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const WorkoutPlan = ({ recommendations }) => {
  if (!recommendations || !recommendations.exercises) {
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

  const { exercises, userGoal, calorieBalance, tips } = recommendations;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Personalized Workout Plan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based on your {userGoal} goal
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
            calorieBalance > 0 ? 'text-danger' : 'text-success'
          }`}>
            {calorieBalance > 0 ? `+${calorieBalance}` : calorieBalance} cal
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {calorieBalance > 0 
            ? 'You have excess calories. Focus on cardio to burn them.'
            : 'You are in a calorie deficit. Great for weight loss!'}
        </p>
      </div>

      {/* Recommended Exercises */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended Exercises
        </h4>
        {exercises.map((exercise, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {exercise.name}
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {exercise.duration} min
                  </span>
                  <span>•</span>
                  <span className="capitalize">{exercise.type}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                {exercise.calories} cal
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Burned
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Expert Tips
        </h4>
        <div className="space-y-2">
          {tips?.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-2"
            >
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tip}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
        <Button size="sm">
          Start Workout
        </Button>
      </div>
    </Card>
  );
};

export default WorkoutPlan;
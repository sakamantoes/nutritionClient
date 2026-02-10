// src/components/dashboard/DailySummary.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  Target
} from 'lucide-react';
import Card from '../common/Card';

const DailySummary = ({ data }) => {
  // Default data if none provided
  const defaultData = {
    totals: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    },
    goals: {
      calories: 2000,
      protein: 75,
      carbs: 275,
      fat: 65
    },
    percentages: {
      protein: 0,
      carbs: 0,
      fat: 0
    },
    remainingCalories: 2000
  };

  const summaryData = data || defaultData;
  const { totals, goals, percentages, remainingCalories } = summaryData;
  
  const calorieProgress = goals.calories > 0 ? 
    Math.min((totals.calories / goals.calories) * 100, 100) : 0;

  const getStatusIcon = (percentage) => {
    if (percentage >= 90) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (percentage >= 70) return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 70) return 'yellow';
    return 'red';
  };

  const nutrients = [
    { 
      label: 'Protein', 
      value: totals.protein || 0, 
      goal: goals.protein || 75, 
      unit: 'g', 
      percentage: percentages.protein || 0 
    },
    { 
      label: 'Carbs', 
      value: totals.carbs || 0, 
      goal: goals.carbs || 275, 
      unit: 'g', 
      percentage: percentages.carbs || 0 
    },
    { 
      label: 'Fat', 
      value: totals.fat || 0, 
      goal: goals.fat || 65, 
      unit: 'g', 
      percentage: percentages.fat || 0 
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Daily Summary
        </h3>
        <Target className="h-5 w-5 text-purple-500" />
      </div>

      {/* Calorie Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Calories
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {totals.calories || 0} / {goals.calories || 2000} cal
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calorieProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-3 rounded-full ${
              calorieProgress >= 100 ? 'bg-red-500' : 'bg-purple-500'
            }`}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {remainingCalories || goals.calories || 2000} cal remaining
          </span>
          <span className={`text-xs font-medium ${
            calorieProgress >= 100 ? 'text-red-600' : 'text-purple-600'
          }`}>
            {Math.round(calorieProgress)}%
          </span>
        </div>
      </div>

      {/* Macronutrients */}
      <div className="space-y-4">
        {nutrients.map((nutrient) => {
          const percentage = Math.min((nutrient.value / nutrient.goal) * 100, 100);
          const statusColor = getStatusColor(percentage);
          
          return (
            <motion.div
              key={nutrient.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-lg ${
                  statusColor === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  statusColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {getStatusIcon(percentage)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {nutrient.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {nutrient.value} {nutrient.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {Math.round(percentage)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  of {nutrient.goal}{nutrient.unit}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totals.fiber || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Fiber (g)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totals.sodium || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sodium (mg)</p>
        </div>
      </div>
    </Card>
  );
};

export default DailySummary;
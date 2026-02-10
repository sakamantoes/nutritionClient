// src/components/dashboard/FoodLogCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Edit2, Trash2, Apple, Coffee, Sandwich, Utensils } from 'lucide-react';
import { format } from 'date-fns';

const FoodLogCard = ({ meal, foods, calories, time, foodData, onEdit, onDelete }) => {
  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast':
        return Coffee;
      case 'lunch':
        return Sandwich;
      case 'dinner':
        return Utensils;
      default:
        return Apple;
    }
  };

  const getMealColor = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'lunch':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'dinner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    }
  };

  const MealIcon = getMealIcon(meal);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-green-200 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getMealColor(meal)}`}>
              <MealIcon className="h-3 w-3 inline mr-1" />
              {meal}
            </span>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {time}
            </div>
            <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Flame className="h-3 w-3 mr-1 text-orange-500" />
              {calories} cal
            </div>
          </div>
          
          <div className="space-y-2">
            {foods.map((food, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  • {food}
                </p>
                {foodData && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    {foodData.protein && <span>{foodData.protein}g protein</span>}
                    {foodData.carbs && <span>• {foodData.carbs}g carbs</span>}
                    {foodData.fat && <span>• {foodData.fat}g fat</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-4">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-500 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FoodLogCard;
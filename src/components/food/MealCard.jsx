// Update src/components/food/MealCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Flame, 
  Edit2, 
  Trash2,
  Apple,
  Coffee,
  Sandwich,
  Utensils
} from 'lucide-react';
import { format } from 'date-fns';

const MealCard = ({ food, onEdit, onDelete }) => {
  // Handle missing data gracefully
  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast':
        return <Coffee className="h-5 w-5" />;
      case 'lunch':
        return <Sandwich className="h-5 w-5" />;
      case 'dinner':
        return <Utensils className="h-5 w-5" />;
      default:
        return <Apple className="h-5 w-5" />;
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

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return 'Invalid time';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Today';
    try {
      return format(new Date(timestamp), 'MMM d, yyyy');
    } catch {
      return 'Today';
    }
  };

  // Default values for missing data
  const foodData = {
    foodName: food?.foodName || food?.food_name || 'Unknown Food',
    mealType: food?.mealType || 'snack',
    timestamp: food?.timestamp || new Date().toISOString(),
    calories: food?.calories || food?.energy_kcal || 0,
    protein: food?.protein || food?.protein_g || 0,
    carbs: food?.carbs || food?.carbohydrates_g || 0,
    fat: food?.fat || food?.total_fat_g || 0,
    servingSize: food?.servingSize || food?.serving_size_g || 0,
    foodGroup: food?.foodGroup || food?.food_group || 'unknown',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${getMealColor(foodData.mealType).split(' ')[0]}`}>
            {getMealIcon(foodData.mealType)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {foodData.foodName}
              </h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getMealColor(foodData.mealType)}`}>
                {foodData.mealType}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(foodData.timestamp)} • {formatDate(foodData.timestamp)}
              </div>
              <div className="flex items-center font-medium text-gray-700 dark:text-gray-300">
                <Flame className="h-3 w-3 mr-1 text-orange-500" />
                {foodData.calories} cal
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {foodData.protein}g
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {foodData.carbs}g
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {foodData.fat}g
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Serving</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {foodData.servingSize}g
                </p>
              </div>
            </div>
            
            {foodData.foodGroup && foodData.foodGroup !== 'unknown' && (
              <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                  {foodData.foodGroup}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-500 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MealCard;
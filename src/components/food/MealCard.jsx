// src/components/food/MealCard.jsx (Updated)
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
  Utensils,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const MealCard = ({ food, onEdit, onDelete }) => {
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
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  const isToday = (timestamp) => {
    if (!timestamp) return false;
    try {
      const today = new Date();
      const date = new Date(timestamp);
      return today.toDateString() === date.toDateString();
    } catch {
      return false;
    }
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
          <div className={`p-3 rounded-lg ${getMealColor(food.mealType).split(' ')[0]}`}>
            {getMealIcon(food.mealType)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {food.foodName || 'Unnamed Food'}
                  </h4>
                  {isToday(food.timestamp) && (
                    <span className="flex items-center text-xs text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Today
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getMealColor(food.mealType)}`}>
                    {food.mealType || 'meal'}
                  </span>
                  {food.foodGroup && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                      {food.foodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(food.timestamp)} • {formatDate(food.timestamp)}
              </div>
              <div className="flex items-center font-medium text-gray-700 dark:text-gray-300">
                <Flame className="h-3 w-3 mr-1 text-orange-500" />
                {food.calories || 0} cal
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {food.protein || 0}g
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {food.carbs || 0}g
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {food.fat || 0}g
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Serving</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {food.servingSize || food.servingSize || 0}g
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-2 ml-4">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Edit"
              title="Edit food"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-500 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              aria-label="Delete"
              title="Delete food"
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
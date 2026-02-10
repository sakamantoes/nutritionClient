// src/components/dashboard/ExerciseCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Dumbbell, Activity } from 'lucide-react';
import YogaIcon from '../icon/icon';

const ExerciseCard = ({ name, type, duration, calories, time }) => {
  const getExerciseIcon = (exerciseType) => {
    switch (exerciseType.toLowerCase()) {
      case 'cardio':
        return <Activity className="h-5 w-5" />;
      case 'strength':
        return <Dumbbell className="h-5 w-5" />;
      case 'flexibility':
        return <YogaIcon />;
      default:
        return <Dumbbell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (exerciseType) => {
    switch (exerciseType.toLowerCase()) {
      case 'cardio':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'strength':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'flexibility':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${getTypeColor(type).split(' ')[0]}`}>
            {getExerciseIcon(type)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {name}
            </h4>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(type)}`}>
                  {type}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                {duration} min
              </div>
              <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Flame className="h-3 w-3 mr-1 text-orange-500" />
                {calories} cal
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {time}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseCard;
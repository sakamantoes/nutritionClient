// src/components/exercise/ExerciseList.jsx - Update to handle real data
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Flame, 
  TrendingUp,
  Calendar,
  Filter,
  Dumbbell,
  Activity,
  Edit2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import Card from '../common/Card';
import Button from '../common/Button';

const ExerciseList = ({ exercises, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Flame className="h-10 w-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No exercises logged yet
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start logging your workouts to track your fitness progress
          </p>
          <Button>
            Log Your First Exercise
          </Button>
        </div>
      </Card>
    );
  }

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
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

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'cardio':
        return <Activity className="h-4 w-4" />;
      case 'strength':
        return <Dumbbell className="h-4 w-4" />;
      case 'flexibility':
        return <Activity className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise, index) => (
        <motion.div
          key={exercise.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${getTypeColor(exercise.exerciseType).split(' ')[0]}`}>
                  {getTypeIcon(exercise.exerciseType)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {exercise.exerciseName}
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(exercise.exerciseType)}`}>
                      {exercise.exerciseType}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {exercise.duration} minutes
                    </div>
                    <div className="flex items-center font-medium text-gray-700 dark:text-gray-300">
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {exercise.caloriesBurned} calories
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(exercise.timestamp), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(exercise)}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(exercise)}
                    className="p-2 text-gray-500 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ExerciseList;
// src/components/exercise/ExerciseList.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Flame, 
  Calendar,
  Dumbbell,
  Activity,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const ExerciseList = ({ exercises = [], onEdit, onDelete, loading, error }) => {
  console.log('ExerciseList received:', { exercises, loading, error, type: typeof exercises }); // Debug log

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-danger mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load exercises
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'Please try again later'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // Handle case where exercises is not an array
  let exerciseArray = [];
  if (Array.isArray(exercises)) {
    exerciseArray = exercises;
  } else if (exercises && typeof exercises === 'object') {
    // If it's an object, check if it has an exerciseLogs property
    if (exercises.exerciseLogs && Array.isArray(exercises.exerciseLogs)) {
      exerciseArray = exercises.exerciseLogs;
    } else if (exercises.data && Array.isArray(exercises.data)) {
      exerciseArray = exercises.data;
    } else {
      // Convert object values to array
      exerciseArray = Object.values(exercises);
    }
  }

  console.log('Processed exerciseArray:', exerciseArray); // Debug log

  if (exerciseArray.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Activity className="h-10 w-10 text-gray-400" />
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
    if (!type) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    
    const typeStr = String(type).toLowerCase();
    switch (typeStr) {
      case 'cardio':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'strength':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'flexibility':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    }
  };

  const getTypeIcon = (type) => {
    if (!type) return <Activity className="h-4 w-4" />;
    
    const typeStr = String(type).toLowerCase();
    switch (typeStr) {
      case 'cardio':
        return <Activity className="h-4 w-4" />;
      case 'strength':
        return <Dumbbell className="h-4 w-4" />;
      case 'flexibility':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatExerciseData = (exercise) => {
    if (!exercise || typeof exercise !== 'object') {
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: 'Unknown Exercise',
        type: 'general',
        duration: 0,
        calories: 0,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      id: exercise.id || exercise._id || Math.random().toString(36).substr(2, 9),
      name: exercise.exerciseName || exercise.name || exercise.exercise_name || 'Unnamed Exercise',
      type: exercise.exerciseType || exercise.type || exercise.exercise_type || 'general',
      duration: exercise.duration || exercise.duration_min || exercise.durationMinutes || 0,
      calories: exercise.caloriesBurned || exercise.calories_burned || exercise.calories || 0,
      timestamp: exercise.timestamp || exercise.createdAt || exercise.date || new Date().toISOString(),
    };
  };

  return (
    <div className="space-y-4">
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm text-blue-800 dark:text-blue-300">
                Showing {exerciseArray.length} exercises
              </span>
            </div>
            <button
              onClick={() => console.log('Exercise data:', exerciseArray)}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded"
            >
              View Data
            </button>
          </div>
        </div>
      )}

      {exerciseArray.map((exercise, index) => {
        const formattedExercise = formatExerciseData(exercise);
        
        return (
          <motion.div
            key={formattedExercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(formattedExercise.type).split(' ')[0]}`}>
                    {getTypeIcon(formattedExercise.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {formattedExercise.name}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(formattedExercise.type)}`}>
                        {formattedExercise.type}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formattedExercise.duration} minutes
                      </div>
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300">
                        <Flame className="h-3 w-3 mr-1 text-orange-500" />
                        {formattedExercise.calories} calories
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(formattedExercise.timestamp), 'MMM d, h:mm a')}
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
        );
      })}
    </div>
  );
};

export default ExerciseList;
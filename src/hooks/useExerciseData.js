import { useQuery, useMutation, useQueryClient } from 'react-query';
import { exerciseApi, mlApi } from '../utils/api';
import toast from 'react-hot-toast';

export const useExerciseData = (userId) => {
  const queryClient = useQueryClient();

  // Get exercise history
  const useExerciseHistory = (params = {}) => {
    return useQuery(
      ['exerciseHistory', userId, params],
      () => exerciseApi.getExerciseHistory(userId, params),
      {
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
      }
    );
  };

  // Get exercise recommendations
  const useExerciseRecommendations = () => {
    return useQuery(
      ['exerciseRecommendations', userId],
      () => exerciseApi.getRecommendations(userId),
      {
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );
  };

  // Log exercise mutation
  const logExerciseMutation = useMutation(exerciseApi.logExercise, {
    onSuccess: () => {
      toast.success('Exercise logged successfully!');
      queryClient.invalidateQueries(['exerciseHistory', userId]);
      queryClient.invalidateQueries(['exerciseRecommendations', userId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to log exercise');
    },
  });

  // Get AI exercise recommendations
  const getAIExerciseRecommendations = useMutation(mlApi.getExerciseRecommendations, {
    onError: (error) => {
      toast.error('Failed to get AI exercise recommendations');
    },
  });

  // Calculate workout statistics
  const calculateWorkoutStats = (exercises) => {
    if (!exercises || exercises.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalCalories: 0,
        averageDuration: 0,
        averageCalories: 0,
        byType: {},
        weeklyTrend: [],
      };
    }

    const stats = {
      totalWorkouts: exercises.length,
      totalDuration: 0,
      totalCalories: 0,
      byType: {},
      weeklyTrend: Array(7).fill(0),
    };

    exercises.forEach(exercise => {
      stats.totalDuration += exercise.duration || 0;
      stats.totalCalories += exercise.caloriesBurned || 0;

      // Group by exercise type
      const type = exercise.exerciseType || 'other';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Weekly trend (simplified)
      const day = new Date(exercise.timestamp).getDay();
      stats.weeklyTrend[day] = (stats.weeklyTrend[day] || 0) + 1;
    });

    stats.averageDuration = Math.round(stats.totalDuration / stats.totalWorkouts);
    stats.averageCalories = Math.round(stats.totalCalories / stats.totalWorkouts);

    return stats;
  };

  // Generate workout plan
  const generateWorkoutPlan = (userData, goal) => {
    const basePlan = {
      cardio: { minutes: 150, sessions: 3 },
      strength: { minutes: 120, sessions: 2 },
      flexibility: { minutes: 60, sessions: 2 },
    };

    switch (goal) {
      case 'lose':
        basePlan.cardio.minutes = 210; // Increase cardio for weight loss
        basePlan.strength.minutes = 90; // Maintain strength training
        break;
      case 'gain':
        basePlan.cardio.minutes = 120; // Moderate cardio for muscle gain
        basePlan.strength.minutes = 180; // Increase strength training
        break;
      case 'maintain':
      default:
        // Keep base plan
        break;
    }

    return basePlan;
  };

  return {
    // Queries
    useExerciseHistory,
    useExerciseRecommendations,
    
    // Mutations
    logExercise: logExerciseMutation.mutateAsync,
    getAIExerciseRecommendations: getAIExerciseRecommendations.mutateAsync,
    
    // Functions
    calculateWorkoutStats,
    generateWorkoutPlan,
    
    // Loading states
    isLoggingExercise: logExerciseMutation.isLoading,
    isGettingAIRecommendations: getAIExerciseRecommendations.isLoading,
  };
};
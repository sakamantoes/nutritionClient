import { useQuery, useMutation, useQueryClient } from 'react-query';
import { foodApi, mlApi } from '../utils/api';
import toast from 'react-hot-toast';

export const useNutritionData = (userId) => {
  const queryClient = useQueryClient();

  // Get daily nutrition summary
  const useDailySummary = (date) => {
    return useQuery(
      ['dailySummary', userId, date],
      () => foodApi.getDailySummary(userId, date),
      {
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );
  };

  // Get food history
  const useFoodHistory = (params = {}) => {
    return useQuery(
      ['foodHistory', userId, params],
      () => foodApi.getFoodHistory(userId, params),
      {
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
      }
    );
  };

  // Search foods
  const useFoodSearch = (query) => {
    return useQuery(
      ['foodSearch', query],
      () => foodApi.searchFoods(query),
      {
        enabled: query?.length >= 2,
        staleTime: 10 * 60 * 1000, // 10 minutes
      }
    );
  };

  // Get nutrition dataset
  const useNutritionDataset = (params = {}) => {
    return useQuery(
      ['nutritionDataset', params],
      () => foodApi.getNutritionDataset(params),
      {
        staleTime: 15 * 60 * 1000, // 15 minutes
      }
    );
  };

  // Log food mutation
  const logFoodMutation = useMutation(foodApi.logFood, {
    onSuccess: () => {
      toast.success('Food logged successfully!');
      queryClient.invalidateQueries(['foodHistory', userId]);
      queryClient.invalidateQueries(['dailySummary', userId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to log food');
    },
  });

  // Delete food log mutation
  const deleteFoodMutation = useMutation(foodApi.deleteFoodLog, {
    onSuccess: () => {
      toast.success('Food log deleted!');
      queryClient.invalidateQueries(['foodHistory', userId]);
      queryClient.invalidateQueries(['dailySummary', userId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete food log');
    },
  });

  // Predict food group
  const predictFoodGroup = useMutation(mlApi.predictFoodGroup, {
    onError: (error) => {
      toast.error('Failed to predict food group');
    },
  });

  // Predict health score
  const predictHealthScore = useMutation(mlApi.predictHealthScore, {
    onError: (error) => {
      toast.error('Failed to predict health score');
    },
  });

  // Analyze nutrition
  const analyzeNutrition = useMutation(mlApi.analyzeNutrition, {
    onError: (error) => {
      toast.error('Failed to analyze nutrition');
    },
  });

  return {
    // Queries
    useDailySummary,
    useFoodHistory,
    useFoodSearch,
    useNutritionDataset,
    
    // Mutations
    logFood: logFoodMutation.mutateAsync,
    deleteFoodLog: deleteFoodMutation.mutateAsync,
    predictFoodGroup: predictFoodGroup.mutateAsync,
    predictHealthScore: predictHealthScore.mutateAsync,
    analyzeNutrition: analyzeNutrition.mutateAsync,
    
    // Loading states
    isLoggingFood: logFoodMutation.isLoading,
    isDeletingFood: deleteFoodMutation.isLoading,
    isPredictingFoodGroup: predictFoodGroup.isLoading,
    isPredictingHealthScore: predictHealthScore.isLoading,
    isAnalyzingNutrition: analyzeNutrition.isLoading,
  };
};
// src/pages/FoodLog.jsx (Updated - Fixed food history display)
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Camera,
  X,
  Clock,
  Flame,
  Apple,
  Coffee,
  Sandwich,
  Utensils,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { foodApi } from '../utils/api';
import toast from 'react-hot-toast';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FoodSearch from '../components/food/FoodSearch';
import FoodLogForm from '../components/food/FoodLogForm';
import MealCard from '../components/food/MealCard';

const FoodLog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showSearch, setShowSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Fetch food history with proper error handling
  const { 
    data: foodHistory = { foodLogs: [], count: 0 }, 
    isLoading, 
    error,
    refetch 
  } = useQuery(
    ['foodHistory', user?.id, mealType, lastRefreshTime],
    () => {
      if (!user?.id) {
        console.log('No user ID, skipping fetch');
        return Promise.resolve({ foodLogs: [], count: 0 });
      }
      return foodApi.getFoodHistory(user.id, { 
        mealType: mealType !== 'all' ? mealType : undefined 
      });
    },
    { 
      enabled: !!user?.id,
      staleTime: 0, // Always refetch when component mounts
      cacheTime: 0, // Don't cache
      retry: 2, // Retry twice on failure
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Food history query error:', error);
        toast.error(`Failed to load food history: ${error.message}`);
      },
      onSuccess: (data) => {
        console.log('Food history loaded successfully:', data);
        if (data?.foodLogs?.length > 0) {
          toast.success(`Loaded ${data.foodLogs.length} food logs`);
        }
      }
    }
  );

  // Log food mutation with proper invalidation
  const logFoodMutation = useMutation(foodApi.logFood, {
    onMutate: async (newFood) => {
      try {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['foodHistory', user?.id, mealType]);
        
        // Snapshot the previous value
        const previousFoodHistory = queryClient.getQueryData(['foodHistory', user?.id, mealType]);
        
        // Create a timestamp for the new food log
        const newFoodWithTimestamp = {
          ...newFood,
          id: Date.now(), // Temporary ID for optimistic update
          timestamp: newFood.timestamp || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        // Optimistically update to the new value
        queryClient.setQueryData(['foodHistory', user?.id, mealType], (old) => {
          if (!old) {
            return { 
              foodLogs: [newFoodWithTimestamp], 
              count: 1,
              success: true 
            };
          }
          
          // Ensure old has the expected structure
          const currentFoodLogs = Array.isArray(old.foodLogs) ? old.foodLogs : [];
          return {
            ...old,
            foodLogs: [newFoodWithTimestamp, ...currentFoodLogs],
            count: (old.count || 0) + 1,
            success: true
          };
        });

        return { previousFoodHistory };
      } catch (error) {
        console.error('Optimistic update failed:', error);
        return { previousFoodHistory: null };
      }
    },
    onSuccess: (response) => {
      console.log('Food logged successfully:', response.data);
      const newFoodLog = response.data?.foodLog;
      
      if (newFoodLog) {
        // Force refetch to ensure we have latest data from server
        setLastRefreshTime(Date.now());
        queryClient.invalidateQueries(['foodHistory', user?.id, mealType]);
        queryClient.invalidateQueries(['dailySummary', user?.id]);
      }
      
      setShowForm(false);
      setSelectedFood(null);
    },
    onError: (error, newFood, context) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to log food';
      console.error('Food log error:', error);
      toast.error(errorMessage);
      
      // Rollback to previous state
      if (context?.previousFoodHistory) {
        queryClient.setQueryData(['foodHistory', user?.id, mealType], context.previousFoodHistory);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['foodHistory', user?.id, mealType]);
    },
  });

  // Delete food log mutation
  const deleteFoodMutation = useMutation(foodApi.deleteFoodLog, {
    onMutate: async (logId) => {
      await queryClient.cancelQueries(['foodHistory', user?.id, mealType]);
      const previousFoodHistory = queryClient.getQueryData(['foodHistory', user?.id, mealType]);
      
      queryClient.setQueryData(['foodHistory', user?.id, mealType], (old) => {
        if (!old || !Array.isArray(old.foodLogs)) return old;
        return {
          ...old,
          foodLogs: old.foodLogs.filter(log => log.id !== logId),
          count: Math.max(0, (old.count || 0) - 1),
          success: true
        };
      });
      
      return { previousFoodHistory };
    },
    onSuccess: () => {
      toast.success('Food log deleted successfully!');
      setLastRefreshTime(Date.now());
    },
    onError: (error, logId, context) => {
      console.error('Delete food error:', error);
      toast.error(error.message || 'Failed to delete food log');
      
      if (context?.previousFoodHistory) {
        queryClient.setQueryData(['foodHistory', user?.id, mealType], context.previousFoodHistory);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['foodHistory', user?.id, mealType]);
      queryClient.invalidateQueries(['dailySummary', user?.id]);
    },
  });

  // Get food logs array safely
  const foodLogsArray = useMemo(() => {
    if (!foodHistory) return [];
    
    // Handle different possible response structures
    if (Array.isArray(foodHistory)) {
      return foodHistory;
    }
    
    if (foodHistory.foodLogs && Array.isArray(foodHistory.foodLogs)) {
      return foodHistory.foodLogs;
    }
    
    // Check for other possible array properties
    const possibleArrayProps = ['data', 'items', 'logs', 'records'];
    for (const prop of possibleArrayProps) {
      if (Array.isArray(foodHistory[prop])) {
        return foodHistory[prop];
      }
    }
    
    return [];
  }, [foodHistory]);

  // Filter food logs based on search query and meal type
  const filteredFoodLogs = useMemo(() => {
    if (!foodLogsArray || !Array.isArray(foodLogsArray)) return [];
    
    return foodLogsArray
      .filter(log => {
        if (!log || typeof log !== 'object') return false;
        
        // Filter by search query
        const matchesSearch = searchQuery === '' || 
          (log.foodName && log.foodName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (log.foodGroup && log.foodGroup.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (log.mealType && log.mealType.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Filter by meal type
        const matchesMealType = mealType === 'all' || log.mealType === mealType;
        
        return matchesSearch && matchesMealType;
      })
      .sort((a, b) => {
        // Sort by timestamp (newest first)
        try {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        } catch {
          return 0;
        }
      });
  }, [foodLogsArray, searchQuery, mealType]);

  const mealTypes = [
    { id: 'all', label: 'All Meals', icon: Utensils, color: 'gray' },
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'yellow' },
    { id: 'lunch', label: 'Lunch', icon: Sandwich, color: 'blue' },
    { id: 'dinner', label: 'Dinner', icon: Utensils, color: 'purple' },
    { id: 'snack', label: 'Snacks', icon: Apple, color: 'green' },
  ];

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setShowForm(true);
  };

  const handleLogFood = (data) => {
    // Validate required fields
    if (!data.foodName || !data.calories) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Ensure we have a userId
    if (!user?.id) {
      toast.error('User not found. Please log in again.');
      return;
    }

    // Prepare data for API
    const foodData = {
      userId: user.id,
      foodName: data.foodName.trim(),
      foodGroup: data.foodGroup || 'other',
      servingSize: data.servingSize || 100,
      calories: Number(data.calories) || 0,
      protein: Number(data.protein) || 0,
      carbs: Number(data.carbs) || 0,
      fat: Number(data.fat) || 0,
      fiber: Number(data.fiber) || 0,
      sugar: Number(data.sugar) || 0,
      sodium: Number(data.sodium) || 0,
      mealType: data.mealType || 'snack',
      timestamp: data.timestamp || new Date().toISOString(),
      imageUrl: data.imageUrl || ''
    };

    console.log('Submitting food data:', foodData);
    logFoodMutation.mutate(foodData);
  };

  const handleDeleteFood = async (logId) => {
    if (!logId) {
      toast.error('Invalid food log ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this food log?')) {
      try {
        await deleteFoodMutation.mutateAsync(logId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setLastRefreshTime(Date.now());
      await refetch();
      toast.success('Food history refreshed!');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh food history');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate nutrition totals
  const nutritionTotals = useMemo(() => {
    return {
      calories: filteredFoodLogs.reduce((sum, log) => sum + (Number(log.calories) || 0), 0),
      protein: filteredFoodLogs.reduce((sum, log) => sum + (Number(log.protein) || 0), 0),
      carbs: filteredFoodLogs.reduce((sum, log) => sum + (Number(log.carbs) || 0), 0),
      fat: filteredFoodLogs.reduce((sum, log) => sum + (Number(log.fat) || 0), 0),
    };
  }, [filteredFoodLogs]);

  // Debug: Log current state
  useEffect(() => {
    console.log('FoodLog Component State:', {
      userId: user?.id,
      foodHistory: foodHistory,
      foodLogsArray: foodLogsArray,
      filteredFoodLogs: filteredFoodLogs,
      isLoading,
      error
    });
  }, [user?.id, foodHistory, foodLogsArray, filteredFoodLogs, isLoading, error]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Food Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily nutrition intake
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowSearch(true)}
            disabled={logFoodMutation.isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            Search Foods
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className='text-white bg-indigo-500 hover:bg-indigo-600'
            disabled={logFoodMutation.isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Food
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search your food history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Found {filteredFoodLogs.length} result{filteredFoodLogs.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              )}
            </div>
            <Button 
              variant="outline"
              disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Scan Food
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        {/* Meal Type Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {mealTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setMealType(type.id)}
              disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                mealType === type.id
                  ? `bg-${type.color}-100 dark:bg-${type.color}-900/30 text-${type.color}-600 dark:text-${type.color}-400`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <type.icon className="h-4 w-4" />
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || logFoodMutation.isLoading || deleteFoodMutation.isLoading}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </motion.div>

      {/* Food History */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Meals
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredFoodLogs.length} food logs
                </span>
                {searchQuery && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    • Search: "{searchQuery}"
                  </span>
                )}
                {mealType !== 'all' && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    • Filter: {mealType}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {(searchQuery || mealType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setMealType('all');
                  }}
                  disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {error ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to load food history
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error.message || 'An error occurred while loading your food history'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleRefresh} 
                  variant="outline"
                  disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => setShowForm(true)}
                  disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food Anyway
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading your food history...
              </p>
            </div>
          ) : filteredFoodLogs.length > 0 ? (
            <div className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Showing {filteredFoodLogs.length} of {foodLogsArray.length} total food logs
                </p>
              </div>
              
              {filteredFoodLogs.map((log, index) => (
                <motion.div
                  key={log.id || `food-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MealCard
                    food={log}
                    onEdit={() => {
                      setSelectedFood(log);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDeleteFood(log.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                {searchQuery || mealType !== 'all' ? (
                  <Search className="h-12 w-12 text-gray-400" />
                ) : (
                  <Utensils className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery 
                  ? `No results found for "${searchQuery}"`
                  : mealType !== 'all'
                  ? `No ${mealType} meals logged yet`
                  : 'No food logged yet'
                }
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? 'Try a different search term or clear your filters'
                  : 'Start logging your meals to track your nutrition'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(searchQuery || mealType !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setMealType('all');
                    }}
                    disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                  >
                    Clear All Filters
                  </Button>
                )}
                <Button 
                  onClick={() => setShowForm(true)}
                  disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Meal
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Nutrition Summary */}
      {filteredFoodLogs.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Nutrition Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nutritionTotals.calories.toFixed(0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Calories
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nutritionTotals.protein.toFixed(1)}g
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Protein
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nutritionTotals.carbs.toFixed(1)}g
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Carbs
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nutritionTotals.fat.toFixed(1)}g
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Fat
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showSearch && (
          <FoodSearch
            onClose={() => setShowSearch(false)}
            onSelect={handleFoodSelect}
          />
        )}

        {showForm && (
          <FoodLogForm
            food={selectedFood}
            onClose={() => {
              setShowForm(false);
              setSelectedFood(null);
            }}
            onSubmit={handleLogFood}
            isLoading={logFoodMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FoodLog;
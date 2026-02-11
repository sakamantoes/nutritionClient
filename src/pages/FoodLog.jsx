// src/pages/FoodLog.jsx (Updated - Fully Responsive with Mobile Nav)
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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Grid,
  List,
  SlidersHorizontal
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
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list or grid
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      staleTime: 0,
      cacheTime: 0,
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Food history query error:', error);
        toast.error(`Failed to load food history: ${error.message}`);
      },
      onSuccess: (data) => {
        console.log('Food history loaded successfully:', data);
      }
    }
  );

  // Log food mutation with proper invalidation
  const logFoodMutation = useMutation(foodApi.logFood, {
    onMutate: async (newFood) => {
      try {
        await queryClient.cancelQueries(['foodHistory', user?.id, mealType]);
        const previousFoodHistory = queryClient.getQueryData(['foodHistory', user?.id, mealType]);
        
        const newFoodWithTimestamp = {
          ...newFood,
          id: Date.now(),
          timestamp: newFood.timestamp || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData(['foodHistory', user?.id, mealType], (old) => {
          if (!old) {
            return { 
              foodLogs: [newFoodWithTimestamp], 
              count: 1,
              success: true 
            };
          }
          
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
      
      if (context?.previousFoodHistory) {
        queryClient.setQueryData(['foodHistory', user?.id, mealType], context.previousFoodHistory);
      }
    },
    onSettled: () => {
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
    
    if (Array.isArray(foodHistory)) {
      return foodHistory;
    }
    
    if (foodHistory.foodLogs && Array.isArray(foodHistory.foodLogs)) {
      return foodHistory.foodLogs;
    }
    
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
        
        const matchesSearch = searchQuery === '' || 
          (log.foodName && log.foodName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (log.foodGroup && log.foodGroup.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (log.mealType && log.mealType.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesMealType = mealType === 'all' || log.mealType === mealType;
        
        return matchesSearch && matchesMealType;
      })
      .sort((a, b) => {
        try {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        } catch {
          return 0;
        }
      });
  }, [foodLogsArray, searchQuery, mealType]);

  // Pagination
  const paginatedFoodLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFoodLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFoodLogs, currentPage]);

  const totalPages = Math.ceil(filteredFoodLogs.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, mealType]);

  const mealTypes = [
    { id: 'all', label: 'All', icon: Utensils, color: 'gray' },
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
    if (!data.foodName || !data.calories) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      toast.error('User not found. Please log in again.');
      return;
    }

    const foodData = {
      userId: user.id,
      foodName: data.foodName.trim(),
      foodGroup: data.foodGroup || 'other',
      servingSize: Number(data.servingSize) || 100,
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
    setMealType('all');
    setShowFilters(false);
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
      className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-6"
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Food Log
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Track your daily nutrition intake
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(true)}
              disabled={logFoodMutation.isLoading}
              className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Search</span>
              <span className="xs:hidden">Find</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none text-white bg-gradient-to-r from-indigo-500 to-indigo-500 hover:from-indigo-600 hover:to-indigo-600 text-xs sm:text-sm px-3 sm:px-4 py-2"
              disabled={logFoodMutation.isLoading}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Add Food</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </motion.div>

        {/* Search Bar - Mobile Optimized */}
        <motion.div variants={itemVariants}>
          <Card className="p-3 sm:p-4">
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 text-sm"
                    disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Mobile Filter Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="xs:hidden flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <SlidersHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hidden xs:flex items-center"
                  disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Scan Food</span>
                  <span className="sm:hidden">Scan</span>
                </Button>
              </div>
            </div>
            
            {/* Search Results Count - Mobile */}
            {searchQuery && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                Found {filteredFoodLogs.length} result{filteredFoodLogs.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}
          </Card>
        </motion.div>

        {/* Controls Bar - Responsive */}
        <motion.div variants={itemVariants} className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
          {/* Meal Type Filter - Horizontal Scroll on Mobile */}
          <div className="w-full xs:w-auto overflow-x-auto pb-1 xs:pb-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-max xs:min-w-0">
              {mealTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMealType(type.id)}
                  disabled={logFoodMutation.isLoading || deleteFoodMutation.isLoading}
                  className={`
                    flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap 
                    transition-all duration-200 text-xs sm:text-sm
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${mealType === type.id
                      ? `bg-${type.color}-100 dark:bg-${type.color}-900/30 text-${type.color}-600 dark:text-${type.color}-400`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <type.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">{type.label}</span>
                  <span className="xs:hidden">{type.id === 'all' ? 'All' : type.label.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center justify-between xs:justify-end w-full xs:w-auto gap-2">
            {/* View Mode Toggle - Hidden on Mobile */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || logFoodMutation.isLoading || deleteFoodMutation.isLoading}
              className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2 py-1.5 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </motion.div>

        {/* Mobile Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xs:hidden"
            >
              <Card className="p-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mealTypes.filter(t => t.id !== 'all').map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setMealType(type.id)}
                        className={`px-3 py-1.5 rounded-full text-xs ${
                          mealType === type.id
                            ? `bg-${type.color}-100 dark:bg-${type.color}-900/30 text-${type.color}-600 dark:text-${type.color}-400`
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  {(searchQuery || mealType !== 'all') && (
                    <button
                      onClick={handleClearSearch}
                      className="text-xs text-primary-600 dark:text-primary-400 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Food History */}
        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Recent Meals
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {filteredFoodLogs.length} {filteredFoodLogs.length === 1 ? 'log' : 'logs'}
                  </span>
                  {searchQuery && (
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  {mealType !== 'all' && (
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full capitalize">
                      {mealType}
                    </span>
                  )}
                </div>
              </div>
              
              {(searchQuery || mealType !== 'all') && (
                <button
                  onClick={handleClearSearch}
                  className="hidden sm:inline text-sm text-primary-600 dark:text-primary-400 hover:underline self-start"
                >
                  Clear filters
                </button>
              )}
            </div>

            {error ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Failed to load food history
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {error.message || 'An error occurred while loading your food history'}
                </p>
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                    Try Again
                  </Button>
                  <Button onClick={() => setShowForm(true)} size="sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                    Add Food
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Loading your food history...
                </p>
              </div>
            ) : paginatedFoodLogs.length > 0 ? (
              <>
                <div className="mb-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    Showing {paginatedFoodLogs.length} of {filteredFoodLogs.length} {filteredFoodLogs.length === 1 ? 'log' : 'logs'}
                  </p>
                </div>
                
                {/* Grid/List View */}
                <div className={`
                  ${viewMode === 'grid' && filteredFoodLogs.length >= 3 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4' 
                    : 'space-y-3 sm:space-y-4'
                  }
                `}>
                  {paginatedFoodLogs.map((log, index) => (
                    <motion.div
                      key={log.id || `food-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between sm:justify-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  {searchQuery || mealType !== 'all' ? (
                    <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                  ) : (
                    <Utensils className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                  )}
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery 
                    ? `No results for "${searchQuery}"`
                    : mealType !== 'all'
                    ? `No ${mealType} meals`
                    : 'No food logged yet'
                  }
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start logging your meals to track your nutrition'
                  }
                </p>
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                  {(searchQuery || mealType !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearSearch}
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                    Add Meal
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Nutrition Summary - Mobile Optimized */}
        {filteredFoodLogs.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Today's Nutrition
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {nutritionTotals.calories.toFixed(0)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Calories
                  </div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {nutritionTotals.protein.toFixed(1)}g
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Protein
                  </div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {nutritionTotals.carbs.toFixed(1)}g
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Carbs
                  </div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {nutritionTotals.fat.toFixed(1)}g
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Fat
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Mobile Spacing for Bottom Navigation */}
        <div className="h-16 sm:h-0 lg:h-0" />

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
      </div>
    </motion.div>
  );
};

export default FoodLog;
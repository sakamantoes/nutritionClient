// src/pages/FoodLog.jsx
import React, { useState, useMemo } from 'react';
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
  Utensils
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

  // Fetch food history
  const { data: foodHistory, isLoading } = useQuery(
    ['foodHistory', user?.id, mealType],
    () => foodApi.getFoodHistory(user?.id, { mealType: mealType !== 'all' ? mealType : undefined }),
    { enabled: !!user }
  );

  // Log food mutation
  const logFoodMutation = useMutation(foodApi.logFood, {
    onSuccess: () => {
      toast.success('Food logged successfully!');
      queryClient.invalidateQueries(['foodHistory', user?.id]);
      setShowForm(false);
      setSelectedFood(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Filter food logs based on search query and meal type
  const filteredFoodLogs = useMemo(() => {
    if (!foodHistory?.foodLogs) return [];
    
    return foodHistory.foodLogs.filter(log => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        log.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.foodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.mealType && log.mealType.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by meal type
      const matchesMealType = mealType === 'all' || log.mealType === mealType;
      
      return matchesSearch && matchesMealType;
    });
  }, [foodHistory?.foodLogs, searchQuery, mealType]);

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
    logFoodMutation.mutate({
      ...data,
      userId: user?.id,
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

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
          >
            <Search className="h-4 w-4 mr-2" />
            Search Foods
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className='text-white bg-indigo-500'
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
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            <Button variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Scan Food
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Meal Type Filter */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {mealTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setMealType(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                mealType === type.id
                  ? `bg-${type.color === 'yellow' ? 'yellow' : type.color === 'blue' ? 'blue' : type.color === 'purple' ? 'purple' : type.color === 'green' ? 'green' : 'gray'}-100 dark:bg-${type.color === 'yellow' ? 'yellow' : type.color === 'blue' ? 'blue' : type.color === 'purple' ? 'purple' : type.color === 'green' ? 'green' : 'gray'}-900/30 text-${type.color === 'yellow' ? 'yellow' : type.color === 'blue' ? 'blue' : type.color === 'purple' ? 'purple' : type.color === 'green' ? 'green' : 'gray'}-600 dark:text-${type.color === 'yellow' ? 'yellow' : type.color === 'blue' ? 'blue' : type.color === 'purple' ? 'purple' : type.color === 'green' ? 'green' : 'gray'}-400`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <type.icon className="h-4 w-4" />
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Food History */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Meals
              </h3>
              {searchQuery && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Showing results for "{searchQuery}"
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total: {filteredFoodLogs.length} items
              </span>
              {filteredFoodLogs.length !== foodHistory?.foodLogs?.length && (
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredFoodLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredFoodLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MealCard
                    food={log}
                    onEdit={() => {
                      setSelectedFood(log);
                      setShowForm(true);
                    }}
                    onDelete={() => {
                      // Implement delete
                    }}
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
                  >
                    Clear All Filters
                  </Button>
                )}
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Meal
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

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
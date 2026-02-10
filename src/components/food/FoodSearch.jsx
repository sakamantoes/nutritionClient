// src/components/food/FoodSearch.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Flame, Apple } from 'lucide-react';
import { useQuery } from 'react-query';
import { foodApi } from '../../utils/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const FoodSearch = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [foodGroup, setFoodGroup] = useState('all');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Test API endpoint manually first
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      console.log('Testing API call with query:', debouncedQuery);
      
      // Test the API directly
      const testApi = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/foods/search?query=${debouncedQuery}`);
          const data = await response.json();
          console.log('Direct fetch response:', data);
        } catch (error) {
          console.error('Direct fetch error:', error);
        }
      };
      
      testApi();
    }
  }, [debouncedQuery]);

  const { 
    data: searchResults, 
    isLoading, 
    error,
    isError 
  } = useQuery(
    ['foodSearch', debouncedQuery],
    () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return Promise.resolve({ results: [] });
      }
      return foodApi.searchFoods(debouncedQuery);
    },
    {
      enabled: debouncedQuery.length >= 2,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      onError: (error) => {
        console.error('Search error:', error);
        toast.error('Failed to search foods. Please try again.');
      },
      select: (data) => {
        console.log('Raw API response:', data);
        
        // Handle different response structures
        if (!data) {
          return { results: [] };
        }
        
        // If axios wraps response in data property
        if (data.data && data.data.results) {
          console.log('Response has data.data.results structure');
          return data.data;
        }
        // If response is direct
        else if (data.results) {
          console.log('Response has direct results structure');
          return data;
        }
        // If response is array directly
        else if (Array.isArray(data)) {
          console.log('Response is array directly');
          return { results: data };
        }
        // If response has different structure
        else {
          console.log('Response has unknown structure, returning empty');
          return { results: [] };
        }
      },
    }
  );

  const foodGroups = [
    { id: 'all', label: 'All' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'meat', label: 'Meat' },
    { id: 'fish', label: 'Fish' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'legumes', label: 'Legumes' },
    { id: 'cereals', label: 'Cereals' },
  ];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  // Get results array safely
  const results = searchResults?.results || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Search Foods
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for foods (e.g., apple, chicken, salad...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Food Group Filters */}
          <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-2">
            {foodGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setFoodGroup(group.id)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                  foodGroup === group.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {isError ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <X className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Search Error
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error?.message || 'Failed to search foods'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="text-sm"
              >
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Searching for foods...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-3">
                {results
                  .filter(food => foodGroup === 'all' || food.food_group === foodGroup)
                  .map((food, index) => (
                    <motion.div
                      key={food.id || food.food_id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        hoverable
                        clickable
                        padding="p-4"
                        onClick={() => {
                          console.log('Selected food:', food);
                          onSelect({
                            foodName: food.food_name || food.name || 'Unknown Food',
                            foodGroup: food.food_group || 'unknown',
                            servingSize: food.serving_size_g || 100,
                            calories: food.energy_kcal || food.calories || 0,
                            protein: food.protein_g || food.protein || 0,
                            carbs: food.carbohydrates_g || food.carbs || 0,
                            fat: food.total_fat_g || food.fat || 0,
                            fiber: food.fiber_g || food.fiber || 0,
                            sugar: food.sugars_g || food.sugar || 0,
                            sodium: food.sodium_mg || food.sodium || 0,
                          });
                          onClose();
                        }}
                        className="hover:border-primary-500 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <Apple className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {food.food_name || food.name || 'Unnamed Food'}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {food.food_group || 'Unknown'} • {food.serving_size_g || 100}g
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                              <Flame className="h-3 w-3 mr-1 text-orange-500" />
                              {food.energy_kcal || food.calories || 0} cal
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {food.protein_g || food.protein || 0}g protein
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          ) : debouncedQuery ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No results found for "{debouncedQuery}"
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Try searching for something else
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Search for foods
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter a food name to search our nutrition database
              </p>
              <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                <Button
                  variant="outline"
                  onClick={() => setQuery('apple')}
                  className="text-sm"
                >
                  Apple
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuery('chicken')}
                  className="text-sm"
                >
                  Chicken
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuery('salad')}
                  className="text-sm"
                >
                  Salad
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuery('yogurt')}
                  className="text-sm"
                >
                  Yogurt
                </Button>
              </div>
            </div>
          )}
        </div>

        
      </motion.div>
    </motion.div>
  );
};

export default FoodSearch;
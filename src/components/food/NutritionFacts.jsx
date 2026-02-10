// src/components/food/NutritionFacts.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Beef, 
  Wheat, 
  Droplets,
  Apple,
  Package,
  Heart
} from 'lucide-react';
import Card from '../common/Card';
import ProgressCircle from '../common/ProgressCircle';

const NutritionFacts = ({ food }) => {
  if (!food) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const nutrients = [
    { 
      label: 'Calories', 
      value: food.calories || food.energy_kcal, 
      unit: 'cal', 
      icon: Flame, 
      color: 'orange',
      dailyValue: 2000
    },
    { 
      label: 'Protein', 
      value: food.protein || food.protein_g, 
      unit: 'g', 
      icon: Beef, 
      color: 'blue',
      dailyValue: 50
    },
    { 
      label: 'Carbs', 
      value: food.carbs || food.carbohydrates_g, 
      unit: 'g', 
      icon: Wheat, 
      color: 'yellow',
      dailyValue: 275
    },
    { 
      label: 'Fat', 
      value: food.fat || food.total_fat_g, 
      unit: 'g', 
      icon: Droplets, 
      color: 'red',
      dailyValue: 65
    },
    { 
      label: 'Fiber', 
      value: food.fiber || food.fiber_g, 
      unit: 'g', 
      icon: Apple, 
      color: 'green',
      dailyValue: 25
    },
    { 
      label: 'Sodium', 
      value: food.sodium || food.sodium_mg, 
      unit: 'mg', 
      icon: Package, 
      color: 'purple',
      dailyValue: 2300
    },
  ];

  const calculatePercentage = (value, dailyValue) => {
    return Math.min(Math.round((value / dailyValue) * 100), 100);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Nutrition Facts
        </h3>
        <Heart className="h-5 w-5 text-primary-500" />
      </div>

      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <ProgressCircle
              value={calculatePercentage(food.calories || 0, 2000)}
              size={80}
              strokeWidth={6}
              color="primary"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              Calories
            </p>
          </div>
          <div className="text-center">
            <ProgressCircle
              value={calculatePercentage(food.protein || 0, 50)}
              size={80}
              strokeWidth={6}
              color="success"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              Protein
            </p>
          </div>
          <div className="text-center">
            <ProgressCircle
              value={calculatePercentage(food.carbs || 0, 275)}
              size={80}
              strokeWidth={6}
              color="warning"
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              Carbs
            </p>
          </div>
        </div>

        {/* Detailed Nutrients */}
        <div className="space-y-4">
          {nutrients.map((nutrient, index) => {
            const percentage = calculatePercentage(nutrient.value || 0, nutrient.dailyValue);
            
            return (
              <motion.div
                key={nutrient.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${nutrient.color}-100 dark:bg-${nutrient.color}-900/30`}>
                    <nutrient.icon className={`h-4 w-4 text-${nutrient.color}-600 dark:text-${nutrient.color}-400`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {nutrient.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Daily Value: {nutrient.dailyValue}{nutrient.unit}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {nutrient.value || 0} {nutrient.unit}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${nutrient.color}-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Health Score */}
        {food.health_score && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Health Score
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI-powered nutrition assessment
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {food.health_score.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  out of 10
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NutritionFacts;
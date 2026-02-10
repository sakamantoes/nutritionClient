// src/components/profile/GoalCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../common/Card';

const GoalCard = ({ goal, progress = 0 }) => {
  const getGoalIcon = (goalType) => {
    switch (goalType) {
      case 'lose':
        return <TrendingDown className="h-6 w-6 text-success" />;
      case 'gain':
        return <TrendingUp className="h-6 w-6 text-warning" />;
      default:
        return <Minus className="h-6 w-6 text-primary" />;
    }
  };

  const getGoalLabel = (goalType) => {
    switch (goalType) {
      case 'lose':
        return 'Weight Loss';
      case 'gain':
        return 'Weight Gain';
      default:
        return 'Weight Maintenance';
    }
  };

  const getGoalColor = (goalType) => {
    switch (goalType) {
      case 'lose':
        return 'success';
      case 'gain':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getGoalDescription = (goalType) => {
    switch (goalType) {
      case 'lose':
        return 'Creating a calorie deficit for weight reduction';
      case 'gain':
        return 'Increasing calorie intake for muscle growth';
      default:
        return 'Balancing calories to maintain current weight';
    }
  };

  const color = getGoalColor(goal);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
            {getGoalIcon(goal)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {getGoalLabel(goal)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getGoalDescription(goal)}
            </p>
          </div>
        </div>
        <Target className="h-6 w-6 text-gray-400" />
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-3 rounded-full bg-${color}-500`}
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recommendations
        </h4>
        {goal === 'lose' && (
          <>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-success mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aim for 1-2 pounds weight loss per week
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-success mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Increase cardio exercise to 150+ minutes weekly
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-success mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Focus on protein-rich foods to preserve muscle
              </p>
            </div>
          </>
        )}
        {goal === 'gain' && (
          <>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-warning mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consume 300-500 extra calories daily
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-warning mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Focus on strength training 3-4 times weekly
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-warning mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Increase protein intake to 1.6-2.2g per kg
              </p>
            </div>
          </>
        )}
        {goal === 'maintain' && (
          <>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary-500 mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Balance calorie intake with expenditure
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary-500 mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Maintain consistent exercise routine
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary-500 mt-1.5"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Focus on nutrient-dense whole foods
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default GoalCard;
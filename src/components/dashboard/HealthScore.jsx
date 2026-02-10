// src/components/dashboard/HealthScore.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import Card from '../common/Card';
import ProgressCircle from '../common/ProgressCircle';

const HealthScore = ({ score = 7.5 }) => {
  const getScoreColor = (score) => {
    if (score >= 9) return 'success';
    if (score >= 7) return 'primary';
    if (score >= 5) return 'warning';
    return 'danger';
  };

  const getScoreLabel = (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = () => {
    // Mock trend for demo
    const trend = 2; // positive trend
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-danger" />;
    }
    return null;
  };

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const recommendations = [
    'Increase vegetable intake',
    'Reduce processed foods',
    'Add more lean protein',
    'Drink more water',
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Health Score
        </h3>
        <Award className="h-5 w-5 text-primary-500" />
      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <ProgressCircle
          value={score * 10}
          max={100}
          size={120}
          strokeWidth={10}
          color={color}
          showValue={false}
        />
        <div className="text-center mt-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {score.toFixed(1)}
            </span>
            <span className="text-2xl text-gray-500 dark:text-gray-400">/10</span>
            {getTrendIcon()}
          </div>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
              {label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recommendations
        </h4>
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <div className="h-2 w-2 rounded-full bg-primary-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {rec}
            </span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default HealthScore;
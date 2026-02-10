// src/components/profile/StatsCard.jsx
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Award,
  Flame,
  Scale
} from 'lucide-react';
import Card from '../common/Card';

const StatsCard = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Calories Logged',
      value: stats?.totalCalories || '0',
      change: '+12%',
      trending: 'up',
      icon: Flame,
      color: 'orange'
    },
    {
      label: 'Weight Progress',
      value: stats?.weightChange || '0 kg',
      change: '-2.5 kg',
      trending: 'down',
      icon: Scale,
      color: 'blue'
    },
    {
      label: 'Exercise Days',
      value: stats?.exerciseDays || '0',
      change: '+3 days',
      trending: 'up',
      icon: Target,
      color: 'green'
    },
    {
      label: 'Achievement Score',
      value: stats?.achievementScore || '0',
      change: '+25 pts',
      trending: 'up',
      icon: Award,
      color: 'purple'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Performance Stats
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statItems.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h4>
              </div>
            </div>
            <div className={`text-right ${stat.trending === 'up' ? 'text-success' : 'text-danger'}`}>
              <div className="flex items-center justify-end">
                {stat.trending === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="font-medium">{stat.change}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                from last month
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatsCard;
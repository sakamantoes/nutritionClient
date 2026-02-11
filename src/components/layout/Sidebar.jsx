import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Home,
  Utensils,
  Dumbbell,
  Activity,
  MessageSquare,
  User,
  Settings,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../utils/api';
import { format } from 'date-fns';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Fetch real-time daily summary for user stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: dailySummary, isLoading } = useQuery(
    ['dailySummary', user?.id, today],
    () => authApi.getDailySummary(user?.id, today),
    {
      enabled: !!user?.id,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
      refetchOnWindowFocus: true,
    }
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/food-log', icon: Utensils, label: 'Food Log' },
    { path: '/exercise', icon: Dumbbell, label: 'Exercise' },
    { path: '/nutrition-analysis', icon: BarChart3, label: 'Analysis' },
    { path: '/chatbot', icon: MessageSquare, label: 'AI Assistant' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Calculate real-time stats
  const currentCalories = dailySummary?.totals?.calories || 0;
  const calorieGoal = user?.daily_calorie_goal || 2000;
  const caloriePercentage = calorieGoal > 0 
    ? Math.min(Math.round((currentCalories / calorieGoal) * 100), 100) 
    : 0;
  const remainingCalories = Math.max(0, calorieGoal - currentCalories);

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed left-0 top-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center">
            <img src="/image/icon.png" alt="NutriHive Logo" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              NutriHive
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI Nutrition Coach
            </p>
          </div>
        </div>
      </div>

     

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <motion.li key={item.path} variants={itemVariants}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500/10 to-secondary-500/10 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          variants={itemVariants}
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
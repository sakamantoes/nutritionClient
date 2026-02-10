// src/components/layout/MobileNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Utensils,
  Dumbbell,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/food-log', icon: Utensils, label: 'Food' },
    { path: '/exercise', icon: Dumbbell, label: 'Exercise' },
    { path: '/nutrition-analysis', icon: BarChart3, label: 'Analysis' },
    { path: '/chatbot', icon: MessageSquare, label: 'AI' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 lg:hidden z-40"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <div className={`p-2 rounded-lg ${({ isActive }) => isActive ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
};

export default MobileNav;
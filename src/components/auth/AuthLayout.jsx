import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Brain, Heart } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-12"
        >
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center">
              <img src="/image/icon.png" alt="" />
            </div>
            <span className="text-2xl font-bold gradient-text">NutriHive</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Brain className="h-4 w-4 mr-1" />
              AI-Powered
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Heart className="h-4 w-4 mr-1" />
              Health Focused
            </div>
          </div>
        </motion.header>

        <div className="max-w-md mx-auto">
          {/* Content Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Decorative Header */}
            <div className="relative h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-success">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>

            <div className="p-8">
              {/* Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {subtitle}
                </p>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.div>

              {/* Bottom Links */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-2">
                <Brain className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">AI Nutrition</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mx-auto mb-2">
                <Activity className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Track Progress</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-2">
                <Heart className="h-5 w-5 text-success-600 dark:text-success-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Health Goals</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
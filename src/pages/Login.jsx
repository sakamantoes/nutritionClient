import React from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue your health journey"
    >
      <LoginForm />
      
      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
      >
        <h4 className="text-sm font-semibold text-primary-800 dark:text-primary-300 mb-2">
          💡 Pro Tip
        </h4>
        <p className="text-xs text-primary-700 dark:text-primary-400">
          Use the demo account to explore all features instantly. No registration required!
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <AuthLayout
      title="Start Your Journey"
      subtitle="Create your account to unlock personalized nutrition tracking"
    >
      <RegisterForm />
      
      {/* Benefits List */}
      <div className="mt-8 space-y-3">
        <div className="flex items-start space-x-3">
          <div className="h-5 w-5 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs text-success-600 dark:text-success-400">✓</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI-powered meal recommendations
          </p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="h-5 w-5 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs text-success-600 dark:text-success-400">✓</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Advanced nutrition analysis
          </p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="h-5 w-5 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs text-success-600 dark:text-success-400">✓</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personalized workout plans
          </p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="h-5 w-5 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs text-success-600 dark:text-success-400">✓</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            24/7 AI nutrition assistant
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
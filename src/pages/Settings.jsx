// src/pages/Settings.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyReport: true,
    mealReminders: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    showCalories: true,
    showProgress: false,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExportData = () => {
    // Implement data export
    alert('Exporting your data...');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement account deletion
      alert('Account deletion requested.');
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    // Implement password change
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and privacy settings
        </p>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-primary-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive {key.toLowerCase()} notifications
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Privacy */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Privacy
                  </h3>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="label">Profile Visibility</label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    className="input"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Show Calories Publicly
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Display your daily calorie intake on your profile
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyChange('showCalories', !privacy.showCalories)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacy.showCalories ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacy.showCalories ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Show Progress Charts
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Share your fitness progress with others
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyChange('showProgress', !privacy.showProgress)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacy.showProgress ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacy.showProgress ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Change Password */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Change Password
                </h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Data Management
              </h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteAccount}
                  className="w-full text-danger border-danger hover:bg-danger-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* App Preferences */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    App Preferences
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Language</label>
                  <select className="input">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="label">Measurement Units</label>
                  <select className="input">
                    <option>Metric (kg, cm)</option>
                    <option>Imperial (lb, ft)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Moon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const isDark = document.documentElement.classList.contains('dark');
                      if (isDark) {
                        document.documentElement.classList.remove('dark');
                      } else {
                        document.documentElement.classList.add('dark');
                      }
                    }}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        document.documentElement.classList.contains('dark') ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
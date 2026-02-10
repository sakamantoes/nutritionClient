import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Award, 
  TrendingUp, 
  Calendar,
  Download,
  Share2,
  Settings,
  Bell,
  Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import UserProfile from '../components/profile/UserProfile';
import GoalCard from '../components/profile/GoalCard';
import StatsCard from '../components/profile/StatsCard';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Award },
    { id: 'history', label: 'History', icon: Calendar },
  ];

  // Mock stats data
  const stats = {
    totalCalories: '45,820',
    weightChange: '-2.5 kg',
    exerciseDays: '18',
    achievementScore: '85',
  };

  const achievements = [
    { id: 1, title: '7-Day Streak', description: 'Logged meals for 7 consecutive days', icon: '🔥', color: 'orange' },
    { id: 2, title: 'Water Champion', description: 'Met water goal for 30 days', icon: '💧', color: 'blue' },
    { id: 3, title: 'Workout Warrior', description: 'Completed 20 workouts', icon: '💪', color: 'green' },
    { id: 4, title: 'Nutrition Master', description: 'Balanced diet for 2 weeks', icon: '🥗', color: 'purple' },
  ];

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
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and track your progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
          <Button className='bg-green-600'>
            <Settings className="h-4 w-4 mr-2 " />
            Settings
          </Button>
        </div>
      </motion.div>

      {/* Profile Stats Banner */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-500 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="opacity-90">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    {user?.goal || 'Maintain'} Weight
                  </span>
                  <span className="text-sm flex items-center">
                    <Bell className="h-3 w-3 mr-1" />
                    Daily Reminders: ON
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-4xl font-bold">85%</div>
              <div className="text-sm opacity-90">Goal Completion</div>
              <div className="mt-2 flex items-center justify-center md:justify-end">
                <Star className="h-4 w-4 text-yellow-300 mr-1" />
                <span className="text-sm">Level 12 Nutrition Pro</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <UserProfile />
          
          {/* Achievements */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Achievements
                </h3>
                <Award className="h-5 w-5 text-warning" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${achievement.color}-500`}
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <StatsCard stats={stats} />
          
          {/* Weekly Progress */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Weekly Progress
              </h3>
              <div className="space-y-4">
                {[
                  { day: 'Mon', calories: 2100, workouts: 1 },
                  { day: 'Tue', calories: 1950, workouts: 2 },
                  { day: 'Wed', calories: 2200, workouts: 1 },
                  { day: 'Thu', calories: 2050, workouts: 1 },
                  { day: 'Fri', calories: 2300, workouts: 2 },
                  { day: 'Sat', calories: 2500, workouts: 1 },
                  { day: 'Sun', calories: 2000, workouts: 0 },
                ].map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="w-16">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {day.day}
                      </span>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Calories
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {day.calories} cal
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-primary-500"
                          style={{ width: `${(day.calories / 2500) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {day.workouts} workout{day.workouts !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <GoalCard goal={user?.goal || 'maintain'} progress={65} />
          
          {/* Current Goals */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Active Goals
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Weight Loss', target: '-5 kg', current: '-2.5 kg', deadline: '2024-03-01' },
                  { title: 'Daily Steps', target: '10,000 steps', current: '8,500 steps', deadline: 'Daily' },
                  { title: 'Water Intake', target: '2.5 L', current: '2.0 L', deadline: 'Daily' },
                  { title: 'Workout Days', target: '20 days', current: '12 days', deadline: '2024-02-28' },
                ].map((goal, index) => {
                  const progress = 50; // Simplified calculation
                  return (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {goal.title}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Due: {goal.deadline}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Progress: {goal.current} / {goal.target}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-success"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {activeTab === 'history' && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Activity History
            </h3>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No history available
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your activity history will appear here once you start using the app
              </p>
              <Button>
                Start Tracking Now
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;
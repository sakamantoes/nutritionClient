// src/pages/Exercise.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  TrendingUp,
  Calendar,
  Target,
  Dumbbell,
  Activity} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { exerciseApi, mlApi } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ExerciseForm from '../components/exercise/ExerciseForm';
import ExerciseList from '../components/exercise/ExerciseList';
import WorkoutPlan from '../components/exercise/WorkoutPlan';

const Exercise = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');

  // Get today's date for filtering
  const getStartOfWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString();
  };

  const getStartOfMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth.toISOString();
  };

  // Build date filter params
  const getDateParams = () => {
    switch (dateFilter) {
      case 'week':
        return { startDate: getStartOfWeek().split('T')[0] };
      case 'month':
        return { startDate: getStartOfMonth().split('T')[0] };
      default:
        return {};
    }
  };

  // Fetch exercise history from backend
  const { data: exerciseHistory, isLoading } = useQuery(
    ['exerciseHistory', user?.id, dateFilter],
    () => exerciseApi.getExerciseHistory(user?.id, getDateParams()),
    { 
      enabled: !!user,
      onError: (error) => {
        toast.error('Failed to load exercise history');
        console.error('Exercise history error:', error);
      }
    }
  );

  // Fetch recommendations from backend
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery(
    ['exerciseRecommendations', user?.id],
    () => exerciseApi.getRecommendations(user?.id),
    { 
      enabled: !!user,
      onError: (error) => {
        console.error('Recommendations error:', error);
      }
    }
  );

  // Log exercise mutation
  const logExerciseMutation = useMutation(exerciseApi.logExercise, {
    onSuccess: (data) => {
      toast.success('Exercise logged successfully!');
      queryClient.invalidateQueries(['exerciseHistory', user?.id]);
      queryClient.invalidateQueries(['exerciseRecommendations', user?.id]);
      setShowForm(false);
      setSelectedExercise(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to log exercise');
    },
  });

  // Get AI recommendations from Python backend
  const { data: aiRecommendations, refetch: getAIRecommendations } = useQuery(
    ['aiExerciseRecommendations', user?.id],
    () => {
      if (!user) return Promise.resolve(null);
      
      // Calculate today's calories from food history
      // For now, use mock data
      const mockData = {
        age: user.age,
        weight: user.weight,
        height: user.height,
        calories_consumed: 2200,
        goal: user.goal,
        activity_level: user.activity_level
      };
      
      return mlApi.getExerciseRecommendations(mockData);
    },
    { 
      enabled: !!user,
      refetchOnWindowFocus: false
    }
  );

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation(
    (exerciseId) => {
      // Since we're using JSON file, we'll handle delete in a custom way
      return exerciseApi.deleteExercise(exerciseId);
    },
    {
      onSuccess: () => {
        toast.success('Exercise deleted successfully!');
        queryClient.invalidateQueries(['exerciseHistory', user?.id]);
      },
      onError: (error) => {
        toast.error('Failed to delete exercise');
      },
    }
  );

  const handleLogExercise = (data) => {
    logExerciseMutation.mutate({
      ...data,
      userId: user?.id,
    });
  };

  const handleDeleteExercise = (exercise) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      deleteExerciseMutation.mutate(exercise.id);
    }
  };

  // Calculate stats from exercise history
  const calculateStats = () => {
    if (!exerciseHistory?.exerciseLogs?.length) {
      return {
        minutesToday: 0,
        caloriesToday: 0,
        workoutsThisMonth: 0,
        goalCompletion: 0,
        exerciseTypes: {
          cardio: 0,
          strength: 0,
          flexibility: 0
        }
      };
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const thisMonth = format(new Date(), 'yyyy-MM');
    
    const todayExercises = exerciseHistory.exerciseLogs.filter(ex => 
      format(new Date(ex.timestamp), 'yyyy-MM-dd') === today
    );
    
    const thisMonthExercises = exerciseHistory.exerciseLogs.filter(ex => 
      format(new Date(ex.timestamp), 'yyyy-MM') === thisMonth
    );

    const minutesToday = todayExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    const caloriesToday = todayExercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
    const workoutsThisMonth = thisMonthExercises.length;

    // Calculate exercise type distribution
    const exerciseTypes = {
      cardio: exerciseHistory.exerciseLogs.filter(ex => ex.exerciseType === 'cardio').length,
      strength: exerciseHistory.exerciseLogs.filter(ex => ex.exerciseType === 'strength').length,
      flexibility: exerciseHistory.exerciseLogs.filter(ex => ex.exerciseType === 'flexibility').length
    };

    // Calculate goal completion (simplified)
    const totalMinutes = exerciseHistory.exerciseLogs.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    const goalMinutes = 300; // Weekly goal
    const goalCompletion = Math.min(Math.round((totalMinutes / goalMinutes) * 100), 100);

    return {
      minutesToday,
      caloriesToday,
      workoutsThisMonth,
      goalCompletion,
      exerciseTypes
    };
  };

  const stats = calculateStats();

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

  // Get exercise type icons for stats
  const getExerciseTypeIcon = (type) => {
    switch (type) {
      case 'cardio': return <Activity className="h-5 w-5" />;
      case 'strength': return <Dumbbell className="h-5 w-5" />;
      case 'flexibility': return <Activity className="h-5 w-5" />;
      default: return <Dumbbell className="h-5 w-5" />;
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Exercise Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Log and monitor your workouts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => getAIRecommendations()}
            loading={recommendationsLoading}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Get AI Recommendations
          </Button>
          <Button className='bg-indigo-700' onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Exercise
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.minutesToday}</p>
              <p className="text-sm opacity-90">Minutes Today</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.caloriesToday}</p>
              <p className="text-sm opacity-90">Calories Burned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.workoutsThisMonth}</p>
              <p className="text-sm opacity-90">Workouts This Month</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.goalCompletion}%</p>
              <p className="text-sm opacity-90">Goal Completion</p>
            </div>
          </div>
          
          {/* Exercise Type Distribution */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <h4 className="text-sm font-medium mb-3">Exercise Type Distribution</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-2">
                  <Activity className="h-6 w-6" />
                </div>
                <p className="text-lg font-bold">{stats.exerciseTypes.cardio}</p>
                <p className="text-xs opacity-90">Cardio</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-2">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <p className="text-lg font-bold">{stats.exerciseTypes.strength}</p>
                <p className="text-xs opacity-90">Strength</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-2">
                  <Activity className="h-6 w-6" />
                </div>
                <p className="text-lg font-bold">{stats.exerciseTypes.flexibility}</p>
                <p className="text-xs opacity-90">Flexibility</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Exercise History */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Exercise History
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-transparent border-0 text-sm focus:outline-none focus:ring-0 dark:bg-gray-800"
                    >
                      <option value="all">All Time</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {exerciseHistory?.count || 0} exercises
                  </div>
                </div>
              </div>
              <ExerciseList
                exercises={exerciseHistory?.exerciseLogs || []}
                loading={isLoading}
                onEdit={(exercise) => {
                  setSelectedExercise(exercise);
                  setShowForm(true);
                }}
                onDelete={handleDeleteExercise}
              />
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Recommendations & Stats */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <WorkoutPlan 
              recommendations={{
                ...recommendations,
                exercises: aiRecommendations?.data?.exercises || recommendations?.recommendations || []
              }} 
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Weekly Goal
                </h3>
                <Target className="h-5 w-5 text-primary-500" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Cardio Minutes
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {stats.exerciseTypes.cardio * 30}/150 min
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500" 
                      style={{ width: `${Math.min((stats.exerciseTypes.cardio * 30 / 150) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Strength Sessions
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {stats.exerciseTypes.strength}/3 sessions
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500" 
                      style={{ width: `${Math.min((stats.exerciseTypes.strength / 3) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Calories Burned
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {stats.caloriesToday}/3,500 cal
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-yellow-500" 
                      style={{ width: `${Math.min((stats.caloriesToday / 3500) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Exercise Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ExerciseForm
            exercise={selectedExercise}
            onClose={() => {
              setShowForm(false);
              setSelectedExercise(null);
            }}
            onSubmit={handleLogExercise}
            isLoading={logExerciseMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Exercise;
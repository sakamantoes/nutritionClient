// src/pages/Exercise.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  TrendingUp,
  Calendar,
  Target,
  AlertCircle,
  Clock,
  Flame,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { exerciseApi } from '../utils/api';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';

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
  const [mockExercises, setMockExercises] = useState([]);

  // Fetch exercise history
  const { 
    data: exerciseResponse, 
    isLoading, 
    error 
  } = useQuery(
    ['exerciseHistory', user?.id, dateFilter],
    () => exerciseApi.getExerciseHistory(user?.id, {
      startDate: dateFilter === 'week' ? getStartOfWeek() : 
                dateFilter === 'month' ? getStartOfMonth() : undefined,
    }),
    { 
      enabled: !!user,
      onError: (err) => {
        console.error('Error fetching exercise history:', err);
        // Use mock data if API fails
        setMockExercises(generateMockExercises());
      }
    }
  );

  // Fetch recommendations
  const { data: recommendationsResponse } = useQuery(
    ['exerciseRecommendations', user?.id],
    () => exerciseApi.getRecommendations(user?.id),
    { 
      enabled: !!user,
      onError: (err) => {
        console.error('Error fetching recommendations:', err);
      }
    }
  );

  // Log exercise mutation
  const logExerciseMutation = useMutation(exerciseApi.logExercise, {
    onSuccess: () => {
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

  const getStartOfWeek = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    return format(start, 'yyyy-MM-dd');
  };

  const getStartOfMonth = () => {
    const start = startOfMonth(new Date());
    return format(start, 'yyyy-MM-dd');
  };

  const generateMockExercises = () => {
    return [
      {
        id: 1,
        exerciseName: 'Morning Run',
        exerciseType: 'cardio',
        duration: 30,
        caloriesBurned: 320,
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        exerciseName: 'Weight Lifting',
        exerciseType: 'strength',
        duration: 45,
        caloriesBurned: 280,
        timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
      {
        id: 3,
        exerciseName: 'Yoga Session',
        exerciseType: 'flexibility',
        duration: 60,
        caloriesBurned: 180,
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ];
  };

  // Extract exercises from API response or use mock data
  const exercises = useMemo(() => {
    if (exerciseResponse?.data?.exerciseLogs) {
      return exerciseResponse.data.exerciseLogs;
    } else if (exerciseResponse?.exerciseLogs) {
      return exerciseResponse.exerciseLogs;
    } else if (Array.isArray(exerciseResponse)) {
      return exerciseResponse;
    } else if (mockExercises.length > 0) {
      return mockExercises;
    } else if (exerciseResponse && typeof exerciseResponse === 'object') {
      // Try to extract any array from the response
      const arrays = Object.values(exerciseResponse).filter(val => Array.isArray(val));
      return arrays.length > 0 ? arrays[0] : [];
    }
    return [];
  }, [exerciseResponse, mockExercises]);

  // Calculate live stats from exercises
  const calculateStats = () => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    let totalToday = {
      minutes: 0,
      calories: 0,
      exercises: 0,
    };

    let totalThisWeek = {
      minutes: 0,
      calories: 0,
      exercises: 0,
    };

    let totalThisMonth = {
      minutes: 0,
      calories: 0,
      exercises: 0,
    };

    exercises.forEach(exercise => {
      if (!exercise.timestamp) return;
      
      const exerciseDate = new Date(exercise.timestamp);
      const exerciseDay = format(exerciseDate, 'yyyy-MM-dd');
      
      // Today's stats
      if (exerciseDay === today) {
        totalToday.minutes += exercise.duration || 0;
        totalToday.calories += exercise.caloriesBurned || 0;
        totalToday.exercises += 1;
      }

      // This week's stats
      if (isWithinInterval(exerciseDate, { start: weekStart, end: weekEnd })) {
        totalThisWeek.minutes += exercise.duration || 0;
        totalThisWeek.calories += exercise.caloriesBurned || 0;
        totalThisWeek.exercises += 1;
      }

      // This month's stats
      if (isWithinInterval(exerciseDate, { start: monthStart, end: monthEnd })) {
        totalThisMonth.minutes += exercise.duration || 0;
        totalThisMonth.calories += exercise.caloriesBurned || 0;
        totalThisMonth.exercises += 1;
      }
    });

    // Calculate goal completion percentage
    const weeklyGoal = {
      cardioMinutes: 150,
      strengthSessions: 3,
      caloriesBurned: 3500,
    };

    const cardioPercentage = Math.min(Math.round((totalThisWeek.minutes / weeklyGoal.cardioMinutes) * 100), 100);
    const strengthPercentage = totalThisWeek.exercises > 0 ? 
      Math.min(Math.round((totalThisWeek.exercises / weeklyGoal.strengthSessions) * 100), 100) : 0;
    const caloriesPercentage = Math.min(Math.round((totalThisWeek.calories / weeklyGoal.caloriesBurned) * 100), 100);

    return {
      today: totalToday,
      thisWeek: totalThisWeek,
      thisMonth: totalThisMonth,
      goalCompletion: {
        cardio: cardioPercentage,
        strength: strengthPercentage,
        calories: caloriesPercentage,
        overall: Math.round((cardioPercentage + strengthPercentage + caloriesPercentage) / 3),
      },
      weeklyGoals: weeklyGoal,
    };
  };

  const stats = calculateStats();

  const handleLogExercise = (data) => {
    logExerciseMutation.mutate({
      ...data,
      userId: user?.id,
    });
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

  // Extract recommendations data
  const recommendations = useMemo(() => {
    if (recommendationsResponse?.data) {
      return recommendationsResponse.data;
    } else if (recommendationsResponse) {
      return recommendationsResponse;
    }
    
    // Fallback recommendations based on user goal
    const userGoal = user?.goal || 'maintain';
    return {
      userGoal,
      todayCalories: stats.today.calories,
      dailyGoal: user?.daily_calorie_goal || 2000,
      calorieBalance: (stats.today.calories || 0) - (user?.daily_calorie_goal || 2000),
      recommendations: userGoal === 'lose' ? [
        {
          name: 'High-Intensity Interval Training (HIIT)',
          duration: 30,
          calories: 350,
          type: 'cardio',
          description: 'Burn maximum calories in minimum time'
        },
        {
          name: 'Running',
          duration: 45,
          calories: 450,
          type: 'cardio',
          description: 'Steady-state cardio for fat burning'
        },
        {
          name: 'Strength Training',
          duration: 45,
          calories: 200,
          type: 'strength',
          description: 'Build muscle to boost metabolism'
        }
      ] : userGoal === 'gain' ? [
        {
          name: 'Weight Lifting',
          duration: 60,
          calories: 250,
          type: 'strength',
          description: 'Focus on compound movements'
        },
        {
          name: 'Bodyweight Training',
          duration: 45,
          calories: 200,
          type: 'strength',
          description: 'Build functional strength'
        },
        {
          name: 'Light Cardio',
          duration: 20,
          calories: 100,
          type: 'cardio',
          description: 'Maintain cardiovascular health'
        }
      ] : [
        {
          name: 'Mixed Workout',
          duration: 45,
          calories: 300,
          type: 'mixed',
          description: 'Combination of cardio and strength'
        },
        {
          name: 'Yoga',
          duration: 60,
          calories: 180,
          type: 'flexibility',
          description: 'Improve flexibility and reduce stress'
        },
        {
          name: 'Swimming',
          duration: 45,
          calories: 350,
          type: 'cardio',
          description: 'Full-body low-impact workout'
        }
      ],
      tips: userGoal === 'lose' ? [
        'Aim for 150-300 minutes of moderate cardio per week',
        'Combine cardio with strength training for optimal fat loss',
        'Stay hydrated and maintain a calorie deficit'
      ] : userGoal === 'gain' ? [
        'Focus on progressive overload in strength training',
        'Allow 48 hours of rest between working the same muscle groups',
        'Ensure adequate protein intake for muscle recovery'
      ] : [
        'Maintain balanced workout routine including all exercise types',
        'Aim for 150 minutes of moderate aerobic activity weekly',
        'Listen to your body and adjust intensity as needed'
      ]
    };
  }, [recommendationsResponse, user, stats.today.calories]);

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
        <Button onClick={() => setShowForm(true)} className='bg-indigo-700'>
          <Plus className="h-4 w-4 mr-2" />
          Log Exercise
        </Button>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div variants={itemVariants}>
          <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Using demo data
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Could not connect to exercise API. Showing sample data.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Overview - Updated with Live Data */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 mr-2 opacity-90" />
              </div>
              <p className="text-3xl font-bold">{stats.today.minutes || 0}</p>
              <p className="text-sm opacity-90">Minutes Today</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-6 w-6 mr-2 opacity-90" />
              </div>
              <p className="text-3xl font-bold">{stats.today.calories || 0}</p>
              <p className="text-sm opacity-90">Calories Burned Today</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-6 w-6 mr-2 opacity-90" />
              </div>
              <p className="text-3xl font-bold">{stats.thisMonth.exercises || 0}</p>
              <p className="text-sm opacity-90">Workouts This Month</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 mr-2 opacity-90" />
              </div>
              <p className="text-3xl font-bold">{stats.goalCompletion.overall || 0}%</p>
              <p className="text-sm opacity-90">Goal Completion</p>
            </div>
          </div>
          <div className="mt-4 text-center text-sm opacity-90">
            {exercises.length} total exercises logged • {stats.thisWeek.calories} calories burned this week
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
                      className="bg-transparent border-0 text-sm focus:outline-none"
                    >
                      <option value="all">All Time</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar View
                  </Button>
                </div>
              </div>
              <ExerciseList
                exercises={exercises}
                loading={isLoading}
                error={error}
                onEdit={(exercise) => {
                  setSelectedExercise(exercise);
                  setShowForm(true);
                }}
                onDelete={(exercise) => {
                  if (window.confirm('Delete this exercise?')) {
                    // Implement delete
                    toast.success('Exercise deleted (demo)');
                  }
                }}
              />
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Recommendations & Stats - Updated with Live Data */}
        <div className="space-y-6 ">
          <motion.div variants={itemVariants}>
            <WorkoutPlan recommendations={recommendations} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Weekly Goal Progress
                </h3>
                <Target className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Cardio Minutes
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {stats.thisWeek.minutes} / {stats.weeklyGoals.cardioMinutes} min
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${stats.goalCompletion.cardio}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      This week
                    </span>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      {stats.goalCompletion.cardio}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Strength Sessions
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {stats.thisWeek.exercises} / {stats.weeklyGoals.strengthSessions} sessions
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${stats.goalCompletion.strength}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      This week
                    </span>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {stats.goalCompletion.strength}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Calories Burned
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {stats.thisWeek.calories.toLocaleString()} / {stats.weeklyGoals.caloriesBurned.toLocaleString()} cal
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${stats.goalCompletion.calories}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      This week
                    </span>
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {stats.goalCompletion.calories}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Weekly Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.thisWeek.exercises}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Workouts
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.thisWeek.minutes}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Minutes
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Exercise Form Modal */}
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
    </motion.div>
  );
};

export default Exercise;
// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  ChevronRight,
  Utensils,
  Dumbbell,
  AlertCircle,
  Droplets,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "react-query";
import { useAuth } from "../hooks/useAuth";
import { authApi, foodApi, exerciseApi, mlApi } from "../utils/api";
import { format } from "date-fns";

// Components
import DailySummary from "../components/dashboard/DailySummary";
import NutritionChart from "../components/dashboard/NutritionChart";
import FoodLogCard from "../components/dashboard/FoodLogCard";
import ExerciseCard from "../components/dashboard/ExerciseCard";
import HealthScore from "../components/dashboard/HealthScore";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Dashboard = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const [healthScore, setHealthScore] = useState(7.5);
  const [dailyStats, setDailyStats] = useState({
    calories: 0,
    protein: 0,
    exerciseMinutes: 0,
    waterIntake: 1.8,
  });

  // Fetch today's food logs
  const { 
    data: todayFoods, 
    isLoading: foodsLoading,
    refetch: refetchFoods,
    isRefetching: isRefetchingFoods
  } = useQuery(
    ["todayFoods", user?.id, today],
    () => foodApi.getFoodHistory(user?.id, {
      startDate: today,
      endDate: today,
    }),
    { 
      enabled: !!user,
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        console.log("Today's foods loaded:", data);
      },
    }
  );

  // Fetch today's exercises - FIXED: Access response.data correctly
  const { 
    data: todayExercises, 
    isLoading: exercisesLoading,
    refetch: refetchExercises,
    isRefetching: isRefetchingExercises
  } = useQuery(
    ["todayExercises", user?.id, today],
    () => exerciseApi.getExerciseHistory(user?.id, {
      startDate: today,
      endDate: today,
    }),
    { 
      enabled: !!user,
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        console.log("Today's exercises loaded:", data);
      },
    }
  );

  // Calculate daily totals from data
  useEffect(() => {
    if (todayFoods?.foodLogs) {
      const totals = todayFoods.foodLogs.reduce(
        (acc, food) => ({
          calories: acc.calories + (food.calories || 0),
          protein: acc.protein + (food.protein || 0),
          carbs: acc.carbs + (food.carbs || 0),
          fat: acc.fat + (food.fat || 0),
          fiber: acc.fiber + (food.fiber || 0),
          sugar: acc.sugar + (food.sugar || 0),
          sodium: acc.sodium + (food.sodium || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      );

      setDailyStats(prev => ({
        ...prev,
        calories: totals.calories,
        protein: totals.protein,
      }));

      // Calculate health score
      calculateHealthScore(totals);
    }
  }, [todayFoods]);

  useEffect(() => {
    // FIXED: Check if todayExercises has data property (full response) or is already the data
    const exerciseData = todayExercises?.data ? todayExercises.data : todayExercises;
    
    if (exerciseData?.exerciseLogs) {
      const totalExerciseMinutes = exerciseData.exerciseLogs.reduce(
        (acc, exercise) => acc + (exercise.duration || 0),
        0
      );
      
      setDailyStats(prev => ({
        ...prev,
        exerciseMinutes: totalExerciseMinutes,
      }));
    }
  }, [todayExercises]);

  const calculateHealthScore = async (nutritionData) => {
    try {
      const completeData = {
        energy_kcal: nutritionData.calories || 0,
        carbohydrates_g: nutritionData.carbs || 0,
        protein_g: nutritionData.protein || 0,
        total_fat_g: nutritionData.fat || 0,
        fiber_g: nutritionData.fiber || 0,
        sugars_g: nutritionData.sugar || 0,
        sodium_mg: nutritionData.sodium || 0,
        saturated_fat_g: nutritionData.fat ? nutritionData.fat * 0.3 : 0,
        unsaturated_fat_g: nutritionData.fat ? nutritionData.fat * 0.7 : 0,
        trans_fat_g: 0,
        vitamin_C_percent_DV: 20,
        calcium_percent_DV: 15,
        iron_percent_DV: 10,
        potassium_mg: 800,
      };

      const response = await mlApi.predictHealthScore(completeData);
      setHealthScore(response.data.health_score);
    } catch (error) {
      console.error("Error calculating health score:", error);
      // Fallback to manual calculation if ML API fails
      const manualScore = calculateManualHealthScore(nutritionData);
      setHealthScore(manualScore);
    }
  };

  const calculateManualHealthScore = (nutritionData) => {
    let score = 7.0; // Base score
    
    // Adjust based on nutrition
    if (nutritionData.protein > 50) score += 0.5;
    if (nutritionData.fiber > 20) score += 0.5;
    if (nutritionData.sugar < 30) score += 0.5;
    if (nutritionData.sodium < 1500) score += 0.5;
    if (nutritionData.fat < 60) score += 0.5;
    
    // Cap between 1 and 10
    return Math.max(1, Math.min(10, score));
  };

  // Generate synthetic weekly data for chart
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      calories: Math.floor(Math.random() * 500) + 1800,
      protein: Math.floor(Math.random() * 40) + 50,
      carbs: Math.floor(Math.random() * 100) + 150,
      fat: Math.floor(Math.random() * 30) + 40,
    }));
  };

  // Stats cards with real data
  const stats = [
    {
      title: "Calories Today",
      value: dailyStats.calories,
      target: user?.daily_calorie_goal || 2000,
      icon: Activity,
      color: "purple",
      unit: "cal",
      percentage: user?.daily_calorie_goal ? 
        Math.round((dailyStats.calories / user.daily_calorie_goal) * 100) : 0
    },
    {
      title: "Protein Intake",
      value: Math.round(dailyStats.protein),
      target: user?.weight ? Math.round(user.weight * 1.2) : 75,
      icon: TrendingUp,
      color: "green",
      unit: "g",
      percentage: user?.weight ? 
        Math.round((dailyStats.protein / (user.weight * 1.2)) * 100) : 0
    },
    {
      title: "Exercise Minutes",
      value: dailyStats.exerciseMinutes,
      target: 60,
      icon: Clock,
      color: "indigo",
      unit: "min",
      percentage: Math.round((dailyStats.exerciseMinutes / 60) * 100)
    },
    {
      title: "Water Intake",
      value: dailyStats.waterIntake,
      target: 2.5,
      icon: Droplets,
      color: "blue",
      unit: "L",
      percentage: Math.round((dailyStats.waterIntake / 2.5) * 100)
    },
  ];

  // Process today's foods for display
  const processedFoods = todayFoods?.foodLogs?.map(food => ({
    meal: food.mealType,
    foods: [food.foodName],
    calories: food.calories,
    time: format(new Date(food.timestamp), 'h:mm a'),
    foodData: food,
  })) || [];

  // FIXED: Process today's exercises for display - handle both response formats
  const exerciseData = todayExercises?.data ? todayExercises.data : todayExercises;
  const processedExercises = exerciseData?.exerciseLogs?.map(exercise => ({
    name: exercise.exerciseName,
    type: exercise.exerciseType,
    duration: exercise.duration,
    calories: exercise.caloriesBurned,
    time: format(new Date(exercise.timestamp), 'h:mm a'),
  })) || [];

  // Create daily summary object for DailySummary component
  const dailySummary = {
    totals: {
      calories: dailyStats.calories,
      protein: dailyStats.protein,
      carbs: todayFoods?.foodLogs?.reduce((acc, food) => acc + (food.carbs || 0), 0) || 0,
      fat: todayFoods?.foodLogs?.reduce((acc, food) => acc + (food.fat || 0), 0) || 0,
      fiber: todayFoods?.foodLogs?.reduce((acc, food) => acc + (food.fiber || 0), 0) || 0,
      sugar: todayFoods?.foodLogs?.reduce((acc, food) => acc + (food.sugar || 0), 0) || 0,
      sodium: todayFoods?.foodLogs?.reduce((acc, food) => acc + (food.sodium || 0), 0) || 0,
    },
    goals: {
      calories: user?.daily_calorie_goal || 2000,
      protein: user?.weight ? Math.round(user.weight * 1.2) : 75,
      carbs: 275,
      fat: 65,
    },
    percentages: {
      protein: user?.weight ? 
        Math.round((dailyStats.protein / (user.weight * 1.2)) * 100) : 0,
      carbs: Math.round(((todayFoods?.foodLogs?.reduce((acc, food) => acc + (food.carbs || 0), 0) || 0) / 275) * 100),
      fat: Math.round(((todayFoods?.foodLogs?.reduce((acc, food) => acc + (food.fat || 0), 0) || 0) / 65) * 100),
    },
    remainingCalories: Math.max(0, (user?.daily_calorie_goal || 2000) - dailyStats.calories),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Handle refresh data
  const handleRefresh = () => {
    refetchFoods();
    refetchExercises();
  };

  // Check if data is being refetched
  const isRefreshing = isRefetchingFoods || isRefetchingExercises;

  // Loading state
  if (foodsLoading || exercisesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name || "User"}! 👋
              </h2>
              <p className="opacity-90">
                {user?.goal === "lose" &&
                  "Keep going! You're on track to reach your weight loss goals."}
                {user?.goal === "gain" &&
                  "Great progress! Keep fueling your muscle growth."}
                {user?.goal === "maintain" &&
                  "Excellent work maintaining your healthy lifestyle!"}
              </p>
              <div className="mt-2 text-sm opacity-80">
                Daily Goal: {user?.daily_calorie_goal || 2000} calories • 
                {user?.goal === "lose" ? " Weight Loss" : 
                 user?.goal === "gain" ? " Weight Gain" : " Maintenance"}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col gap-2">
              <Button 
                variant="white" 
                size="lg" 
                className="font-semibold" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Refresh Data
                  </>
                )}
              </Button>
              <Button variant="outline-white" size="sm" className="font-semibold">
                View Weekly Report
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants} custom={index}>
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}
                  >
                    <stat.icon
                      className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    {stat.percentage}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value} <span className="text-sm">{stat.unit}</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`bg-${stat.color}-500 h-2 rounded-full transition-all duration-500`}
                      style={{
                        width: `${Math.min(stat.percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      0 {stat.unit}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.target} {stat.unit}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Debug Info */}
     

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nutrition Chart */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Nutrition Overview
                </h3>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    This Week
                  </span>
                </div>
              </div>
              <NutritionChart data={generateWeeklyData()} />
            </Card>
          </motion.div>

          {/* Recent Food Logs */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Today's Meals
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {processedFoods.length} items • {dailyStats.calories} cal
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/food-log'}
                  >
                    View All
                  </Button>
                </div>
              </div>
              {processedFoods.length > 0 ? (
                <div className="space-y-4">
                  {processedFoods.map((food, index) => (
                    <FoodLogCard
                      key={index}
                      meal={food.meal}
                      foods={food.foods}
                      calories={food.calories}
                      time={food.time}
                      foodData={food.foodData}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Utensils className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No meals logged today
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start tracking your nutrition by adding your first meal
                  </p>
                  <Button className="mt-4" onClick={() => window.location.href = '/food-log'}>
                    Log Your First Meal
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Health Score */}
          <motion.div variants={itemVariants}>
            <HealthScore score={healthScore} />
          </motion.div>

          {/* Daily Summary */}
          <motion.div variants={itemVariants}>
            <DailySummary data={dailySummary} />
          </motion.div>

          {/* Exercise Today - FIXED: Updated to use processedExercises */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Today's Exercise
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {processedExercises.length} activities • {dailyStats.exerciseMinutes} min
                  </span>
                </div>
              </div>
              {processedExercises.length > 0 ? (
                <div className="space-y-4">
                  {processedExercises.map((exercise, index) => (
                    <ExerciseCard
                      key={index}
                      name={exercise.name}
                      type={exercise.type}
                      duration={exercise.duration}
                      calories={exercise.calories}
                      time={exercise.time}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Dumbbell className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No exercises logged today
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start tracking your workouts
                  </p>
                  <Button className="mt-4" onClick={() => window.location.href = '/exercise'}>
                    Log Exercise
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  fullWidth 
                  variant="white" 
                  size="lg"
                  onClick={() => window.location.href = '/food-log'}
                >
                  Log Food
                </Button>
                <Button 
                  fullWidth 
                  variant="outline-white" 
                  size="lg"
                  onClick={() => window.location.href = '/exercise'}
                >
                  Add Exercise
                </Button>
                <Button 
                  fullWidth 
                  variant="outline-white" 
                  size="lg"
                  onClick={() => window.location.href = '/chatbot'}
                >
                  Ask AI Assistant
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
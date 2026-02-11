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
  Droplets,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "react-query";
import { useAuth } from "../hooks/useAuth";
import { foodApi, exerciseApi, mlApi } from "../utils/api";
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
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    exerciseMinutes: 0,
    waterIntake: 1.8,
  });

  // Fetch today's food logs with proper error handling
  const { 
    data: foodsResponse, 
    isLoading: foodsLoading,
    refetch: refetchFoods,
    isRefetching: isRefetchingFoods,
    error: foodsError
  } = useQuery(
    ["foodHistory", user?.id, today],
    () => foodApi.getFoodHistory(user?.id, {
      startDate: today,
      endDate: today,
    }),
    { 
      enabled: !!user,
      refetchOnWindowFocus: true,
      retry: 2,
      onSuccess: (response) => {
        console.log("✅ Foods API Success - Full Response:", response);
        console.log("✅ Foods Data:", response?.data || response);
      },
      onError: (error) => {
        console.error("❌ Foods API Error:", error);
      }
    }
  );

  // Fetch today's exercises with proper error handling
  const { 
    data: exercisesResponse, 
    isLoading: exercisesLoading,
    refetch: refetchExercises,
    isRefetching: isRefetchingExercises,
    error: exercisesError
  } = useQuery(
    ["exerciseHistory", user?.id, today],
    () => exerciseApi.getExerciseHistory(user?.id, {
      startDate: today,
      endDate: today,
    }),
    { 
      enabled: !!user,
      refetchOnWindowFocus: true,
      retry: 2,
      onSuccess: (response) => {
        console.log("✅ Exercises API Success - Full Response:", response);
        console.log("✅ Exercises Data:", response?.data || response);
      },
      onError: (error) => {
        console.error("❌ Exercises API Error:", error);
      }
    }
  );

  // Extract food logs from response (handle both direct and nested data)
  const foodLogs = foodsResponse?.data?.foodLogs || 
                    foodsResponse?.foodLogs || 
                    [];

  // Extract exercise logs from response (handle both direct and nested data)
  const exerciseLogs = exercisesResponse?.data?.exerciseLogs || 
                       exercisesResponse?.exerciseLogs || 
                       [];

  // Debug logging
  useEffect(() => {
    console.log("📊 Current State - User:", user?.id);
    console.log("📊 Current State - Today:", today);
    console.log("📊 Current State - Food Logs Count:", foodLogs.length);
    console.log("📊 Current State - Exercise Logs Count:", exerciseLogs.length);
    console.log("📊 Current State - Raw Food Response:", foodsResponse);
    console.log("📊 Current State - Raw Exercise Response:", exercisesResponse);
  }, [foodLogs, exerciseLogs, foodsResponse, exercisesResponse, user, today]);

  // Calculate daily totals from food logs
  useEffect(() => {
    if (foodLogs && foodLogs.length > 0) {
      console.log("🧮 Processing food logs:", foodLogs);
      
      const totals = foodLogs.reduce(
        (acc, food) => ({
          calories: acc.calories + (Number(food.calories) || 0),
          protein: acc.protein + (Number(food.protein) || 0),
          carbs: acc.carbs + (Number(food.carbs) || 0),
          fat: acc.fat + (Number(food.fat) || 0),
          fiber: acc.fiber + (Number(food.fiber) || 0),
          sugar: acc.sugar + (Number(food.sugar) || 0),
          sodium: acc.sodium + (Number(food.sodium) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      );

      console.log("📊 Calculated Food Totals:", totals);
      
      setDailyStats(prev => ({
        ...prev,
        ...totals,
      }));

      // Calculate health score
      calculateHealthScore(totals);
    } else {
      // Reset stats if no food logs
      setDailyStats(prev => ({
        ...prev,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }));
      setHealthScore(5.0); // Default score when no data
    }
  }, [foodLogs]);

  // Calculate exercise minutes from exercise logs
  useEffect(() => {
    if (exerciseLogs && exerciseLogs.length > 0) {
      console.log("🧮 Processing exercise logs:", exerciseLogs);
      
      const totalExerciseMinutes = exerciseLogs.reduce(
        (acc, exercise) => acc + (Number(exercise.duration) || 0),
        0
      );
      
      console.log("📊 Total Exercise Minutes:", totalExerciseMinutes);
      
      setDailyStats(prev => ({
        ...prev,
        exerciseMinutes: totalExerciseMinutes,
      }));
    } else {
      setDailyStats(prev => ({
        ...prev,
        exerciseMinutes: 0,
      }));
    }
  }, [exerciseLogs]);

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
      const score = response.data.health_score || 7.5;
      setHealthScore(score);
    } catch (error) {
      console.error("Error calculating health score:", error);
      const manualScore = calculateManualHealthScore(nutritionData);
      setHealthScore(manualScore);
    }
  };

  const calculateManualHealthScore = (nutritionData) => {
    if (nutritionData.calories === 0) return 5.0; // Default when no data
    
    let score = 7.0; // Base score
    
    if (nutritionData.protein > 50) score += 0.5;
    if (nutritionData.fiber > 20) score += 0.5;
    if (nutritionData.sugar < 30) score += 0.5;
    if (nutritionData.sodium < 1500) score += 0.5;
    if (nutritionData.fat < 60) score += 0.5;
    
    return Math.max(1, Math.min(10, Number(score.toFixed(1))));
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

  // Calculate target protein based on user weight
  const getTargetProtein = () => {
    if (user?.weight) {
      return Math.round(user.weight * (user.goal === 'gain' ? 1.6 : 1.2));
    }
    return 75;
  };

  // Stats cards with real data
  const stats = [
    {
      title: "Calories Today",
      value: dailyStats.calories,
      target: user?.daily_calorie_goal || 2000,
      icon: Activity,
      color: "indigo",
      unit: "cal",
      percentage: user?.daily_calorie_goal ? 
        Math.min(100, Math.round((dailyStats.calories / user.daily_calorie_goal) * 100)) : 0
    },
    {
      title: "Protein Intake",
      value: Math.round(dailyStats.protein),
      target: getTargetProtein(),
      icon: TrendingUp,
      color: "emerald",
      unit: "g",
      percentage: getTargetProtein() > 0 ? 
        Math.min(100, Math.round((dailyStats.protein / getTargetProtein()) * 100)) : 0
    },
    {
      title: "Exercise Minutes",
      value: dailyStats.exerciseMinutes,
      target: 60,
      icon: Clock,
      color: "violet",
      unit: "min",
      percentage: Math.min(100, Math.round((dailyStats.exerciseMinutes / 60) * 100))
    },
    {
      title: "Water Intake",
      value: dailyStats.waterIntake,
      target: 2.5,
      icon: Droplets,
      color: "blue",
      unit: "L",
      percentage: Math.min(100, Math.round((dailyStats.waterIntake / 2.5) * 100))
    },
  ];

  // Process today's foods for display
  const processedFoods = foodLogs.map(food => ({
    id: food.id,
    meal: food.mealType || 'snack',
    mealType: food.mealType,
    foods: [food.foodName],
    calories: food.calories || 0,
    time: food.timestamp ? format(new Date(food.timestamp), 'h:mm a') : '',
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fat: food.fat || 0,
    fiber: food.fiber || 0,
    sugar: food.sugar || 0,
    sodium: food.sodium || 0,
    foodName: food.foodName,
    foodGroup: food.foodGroup,
    servingSize: food.servingSize,
    foodData: food,
  })) || [];

  // Process today's exercises for display
  const processedExercises = exerciseLogs.map(exercise => ({
    id: exercise.id,
    name: exercise.exerciseName,
    type: exercise.exerciseType,
    duration: exercise.duration || 0,
    calories: exercise.caloriesBurned || 0,
    time: exercise.timestamp ? format(new Date(exercise.timestamp), 'h:mm a') : '',
  })) || [];

  // Create daily summary object for DailySummary component
  const dailySummary = {
    totals: {
      calories: dailyStats.calories,
      protein: dailyStats.protein,
      carbs: dailyStats.carbs,
      fat: dailyStats.fat,
      fiber: dailyStats.fiber,
      sugar: dailyStats.sugar,
      sodium: dailyStats.sodium,
    },
    goals: {
      calories: user?.daily_calorie_goal || 2000,
      protein: getTargetProtein(),
      carbs: 275,
      fat: 65,
    },
    percentages: {
      protein: getTargetProtein() > 0 ? 
        Math.round((dailyStats.protein / getTargetProtein()) * 100) : 0,
      carbs: Math.round((dailyStats.carbs / 275) * 100) || 0,
      fat: Math.round((dailyStats.fat / 65) * 100) || 0,
    },
    remainingCalories: Math.max(0, (user?.daily_calorie_goal || 2000) - dailyStats.calories),
    foodCount: foodLogs.length,
    exerciseCount: exerciseLogs.length,
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
    console.log("🔄 Manual refresh triggered");
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
                {foodLogs.length > 0 
                  ? `You've logged ${foodLogs.length} meal${foodLogs.length !== 1 ? 's' : ''} today`
                  : "Ready to track your nutrition today?"}
              </p>
              <div className="mt-2 text-sm opacity-80 flex flex-wrap gap-2">
                <span>Daily Goal: {user?.daily_calorie_goal || 2000} calories</span>
                <span>•</span>
                <span>
                  {user?.goal === "lose" ? "Weight Loss" : 
                   user?.goal === "gain" ? "Weight Gain" : "Maintenance"}
                </span>
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
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => {
          // Dynamic color classes
          const colorMap = {
            indigo: {
              bg: 'bg-indigo-100 dark:bg-indigo-900/30',
              text: 'text-indigo-600 dark:text-indigo-400',
              bar: 'bg-indigo-500'
            },
            emerald: {
              bg: 'bg-emerald-100 dark:bg-emerald-900/30',
              text: 'text-emerald-600 dark:text-emerald-400',
              bar: 'bg-emerald-500'
            },
            violet: {
              bg: 'bg-violet-100 dark:bg-violet-900/30',
              text: 'text-violet-600 dark:text-violet-400',
              bar: 'bg-violet-500'
            },
            blue: {
              bg: 'bg-blue-100 dark:bg-blue-900/30',
              text: 'text-blue-600 dark:text-blue-400',
              bar: 'bg-blue-500'
            }
          };
          
          const colors = colorMap[stat.color] || colorMap.indigo;
          
          return (
            <motion.div key={stat.title} variants={itemVariants} custom={index}>
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <stat.icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                      {stat.percentage}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value} <span className="text-sm font-normal">{stat.unit}</span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stat.title}
                  </p>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${colors.bar} h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${stat.percentage}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        0
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {stat.target} {stat.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Debug Info - REMOVE IN PRODUCTION */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <details>
            <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Debug Info (Click to expand)
            </summary>
            <div className="mt-4 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Food Logs:</p>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto max-h-40">
                    {JSON.stringify(foodLogs, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Exercise Logs:</p>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto max-h-40">
                    {JSON.stringify(exerciseLogs, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Daily Stats:</p>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                    {JSON.stringify(dailyStats, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Daily Summary:</p>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                    {JSON.stringify(dailySummary, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </details>
        </Card>
      )}

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
                    {foodLogs.length} item{foodLogs.length !== 1 ? 's' : ''} • {dailyStats.calories} cal
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
              {foodLogs.length > 0 ? (
                <div className="space-y-4">
                  {processedFoods.map((food, index) => (
                    <FoodLogCard
                      key={food.id || index}
                      meal={food.meal}
                      foods={food.foods}
                      calories={food.calories}
                      time={food.time}
                      protein={food.protein}
                      carbs={food.carbs}
                      fat={food.fat}
                      foodName={food.foodName}
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
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start tracking your nutrition by adding your first meal
                  </p>
                  <Button onClick={() => window.location.href = '/food-log'}>
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
            <HealthScore 
              score={healthScore} 
              hasData={foodLogs.length > 0}
            />
          </motion.div>

          {/* Daily Summary */}
          <motion.div variants={itemVariants}>
            <DailySummary 
              data={dailySummary} 
              hasData={foodLogs.length > 0}
            />
          </motion.div>

          {/* Exercise Today */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Today's Exercise
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {exerciseLogs.length} activit{exerciseLogs.length !== 1 ? 'ies' : 'y'} • {dailyStats.exerciseMinutes} min
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/exercise'}
                  >
                    View All
                  </Button>
                </div>
              </div>
              {exerciseLogs.length > 0 ? (
                <div className="space-y-4">
                  {processedExercises.map((exercise, index) => (
                    <ExerciseCard
                      key={exercise.id || index}
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
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start tracking your workouts
                  </p>
                  <Button onClick={() => window.location.href = '/exercise'}>
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
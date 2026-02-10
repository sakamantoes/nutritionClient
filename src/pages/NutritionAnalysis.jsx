// src/pages/NutritionAnalysis.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
  RefreshCw,
  Brain,
  Calendar,
  Target,
  Flame,
  Beef,
  Wheat,
  Apple,
  Scale,
  Droplets,
  Clock,
} from "lucide-react";
import { useQuery, useMutation } from "react-query";
import { useAuth } from "../hooks/useAuth";
import { analysisApi } from "../utils/api";
import toast from "react-hot-toast";

// Components
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

const NutritionAnalysis = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [analysisData, setAnalysisData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);

  // Fetch real analysis data
  const {
    data: analysisResponse,
    isLoading: analysisLoading,
    refetch: refetchAnalysis,
  } = useQuery(
    ["nutritionAnalysis", user?.id, timeRange],
    () =>
      analysisApi.analyzeNutrition({
        userId: user?.id,
        timeRange: timeRange,
      }),
    {
      enabled: !!user,
      onSuccess: (response) => {
        console.log("Analysis API response:", response);
        if (response.status === "success") {
          setAnalysisData(response);
        } else {
          // Use mock data if API response is not successful
          setAnalysisData(getMockAnalysisData());
        }
      },
      onError: (error) => {
        console.error("Analysis fetch error:", error);
        // Fallback to mock data if API fails
        toast.error("Failed to fetch analysis data. Using mock data.");
        setAnalysisData(getMockAnalysisData());
      },
    },
  );

  // Fetch insights
  const {
    data: insightsResponse,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useQuery(
    ["nutritionInsights", user?.id, timeRange],
    () =>
      analysisApi.getNutritionInsights({
        userId: user?.id,
        goal: user?.goal,
        timeRange: timeRange,
      }),
    {
      enabled: !!user && !analysisLoading,
      onSuccess: (response) => {
        console.log("Insights API response:", response);
        if (response.status === "success") {
          setInsightsData(response.insights);
        }
      },
      onError: (error) => {
        console.error("Insights fetch error:", error);
        toast.error("Failed to fetch insights data.");
      },
    },
  );

  // Fetch trends
  const { data: trendsResponse, isLoading: trendsLoading } = useQuery(
    ["nutritionTrends", user?.id],
    () => analysisApi.getNutritionTrends(user?.id, { period: "30" }),
    {
      enabled: !!user,
      onSuccess: (response) => {
        console.log("Trends API response:", response);
      },
      onError: (error) => {
        console.error("Trends fetch error:", error);
        toast.error("Failed to fetch trends data.");
      },
    },
  );

  const getMockAnalysisData = () => {
    return {
      overallScore: 7.8,
      strengths: [
        "Consistent eating schedule",
        "Good hydration habits",
        "Regular meal timing",
      ],
      weaknesses: [
        "Could increase vegetable intake",
        "Weekend eating patterns differ",
        "Snacking frequency is high",
      ],
      recommendations: [
        "Add one more serving of vegetables daily",
        "Plan meals ahead for weekends",
        "Choose healthier snack options",
        "Increase water intake by 500ml",
      ],
      nutrientBreakdown: {
        protein: { current: 68, goal: 75, unit: "g" },
        carbs: { current: 245, goal: 275, unit: "g" },
        fat: { current: 58, goal: 65, unit: "g" },
        fiber: { current: 20, goal: 25, unit: "g" },
        sugar: { current: 42, goal: 50, unit: "g" },
        sodium: { current: 2450, goal: 2300, unit: "mg" },
      },
      analysis: {
        calorieBalance: -120,
        macronutrientBalance: "good",
        micronutrientScore: 7.5,
        processedFoodPercentage: 18,
        hydrationScore: 8.2,
        daysAnalyzed: 7,
        totalMeals: 21,
        averageCaloriesPerMeal: 420,
      },
      user: {
        id: user?.id,
        name: user?.name,
        goal: user?.goal,
        daily_calorie_goal: user?.daily_calorie_goal || 2000,
      },
      timeRange: timeRange,
      status: "success",
    };
  };

  const getMockInsightsData = () => {
    return {
      calorie_deficit_needed: 500,
      protein_target_multiplier: 1.2,
      carb_target_multiplier: 0.8,
      recommended_foods: [
        "Leafy greens",
        "Lean proteins",
        "Whole grains",
        "Berries",
        "Greek yogurt",
        "Eggs",
        "Chicken breast",
        "Broccoli",
      ],
      foods_to_limit: [
        "Processed foods",
        "Sugary drinks",
        "Refined carbs",
        "Fried foods",
        "High-sugar snacks",
      ],
      exercise_recommendations: {
        cardio_minutes: 150,
        strength_sessions: 3,
        intensity: "moderate_to_high",
        focus: "Fat burning and calorie deficit",
      },
      focus: "Monthly progress",
      tip: "Review your progress and adjust goals based on results",
      actionable_steps: [
        "Aim for a deficit of 500 calories",
        "Include protein in every meal",
        "Drink at least 8 glasses of water daily",
        "Get 150 minutes of cardio weekly",
        "Practice 3 strength sessions weekly",
      ],
    };
  };

  const handleRefreshAnalysis = () => {
    refetchAnalysis();
    refetchInsights();
    toast.success("Refreshing analysis...");
  };

  const handleExportReport = () => {
    if (!analysisData) return;

    const report = {
      timestamp: new Date().toISOString(),
      user: analysisData.user,
      timeRange: analysisData.timeRange,
      overallScore: analysisData.overallScore,
      strengths: analysisData.strengths,
      weaknesses: analysisData.weaknesses,
      recommendations: analysisData.recommendations,
      nutrientBreakdown: analysisData.nutrientBreakdown,
      analysis: analysisData.analysis,
      insights: insightsData,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `nutrition-analysis-${user?.id}-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Report exported successfully!");
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
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Use real data if available, otherwise use mock data
  const data = analysisData || getMockAnalysisData();
  const insights = insightsData || getMockInsightsData();
  const trends = trendsResponse || { summary: {} };

  // Debug logging
  useEffect(() => {
    console.log("Current analysis data:", data);
    console.log("Current insights data:", insights);
    console.log("Current trends data:", trends);
  }, [data, insights, trends]);

  if (analysisLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Analyzing your nutrition data...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Processing meals from the last {timeRange}
          </p>
        </div>
      </div>
    );
  }

  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    return "danger";
  };

  // Helper function to get nutrient icon
  const getNutrientIcon = (nutrient) => {
    switch (nutrient.toLowerCase()) {
      case "protein":
        return <Beef className="h-4 w-4" />;
      case "carbs":
        return <Wheat className="h-4 w-4" />;
      case "fat":
        return <Droplets className="h-4 w-4" />;
      case "fiber":
        return <Apple className="h-4 w-4" />;
      case "sugar":
        return <Apple className="h-4 w-4" />;
      case "sodium":
        return <Scale className="h-4 w-4" />;
      default:
        return <Flame className="h-4 w-4" />;
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
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="h-6 w-6 mr-2 text-primary-500" />
            Nutrition Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered insights into your eating habits
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefreshAnalysis}
            loading={analysisLoading || insightsLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {["day", "week", "month", "year"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      timeRange === range
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {data.analysis?.daysAnalyzed || 7} days analyzed
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Overall Score */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Nutrition Score</h2>
              <p className="opacity-90">
                Based on analysis of {data.analysis?.totalMeals || 0} meals over{" "}
                {data.analysis?.daysAnalyzed || 7} days
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-success mr-2"></div>
                  <span className="text-sm">Excellent (8-10)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-warning mr-2"></div>
                  <span className="text-sm">Good (6-7.9)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-danger mr-2"></div>
                  <span className="text-sm">Needs Improvement (0-5.9)</span>
                </div>
              </div>
            </div>
            <div className="text-center mt-6 md:mt-0">
              <div className="text-6xl font-bold">
                {data.overallScore?.toFixed(1) || 7.8}
              </div>
              <div className="text-lg opacity-90">out of 10</div>
              <div className="mt-2 text-sm">
                {data.overallScore >= 8
                  ? "Excellent"
                  : data.overallScore >= 6
                    ? "Good"
                    : "Needs Improvement"}
              </div>
              <div className="mt-4 text-xs opacity-75">Updated just now</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Calorie Balance
                </p>
                <p
                  className={`text-2xl font-bold ${data.analysis?.calorieBalance > 0 ? "text-danger" : "text-success"}`}
                >
                  {data.analysis?.calorieBalance > 0 ? "+" : ""}
                  {data.analysis?.calorieBalance || -120}
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg. Meals/Day
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.analysis?.totalMeals && data.analysis?.daysAnalyzed
                    ? (
                        data.analysis.totalMeals / data.analysis.daysAnalyzed
                      ).toFixed(1)
                    : "3.0"}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Processed Foods
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.analysis?.processedFoodPercentage || 18}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hydration
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.analysis?.hydrationScore?.toFixed(1) || 8.2}/10
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Strengths & Weaknesses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strengths - Ensure we have data before rendering */}
          {data.strengths && data.strengths.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-success" />
                    Strengths
                  </h3>
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div className="space-y-3">
                  {data.strengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">
                        {strength}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Weaknesses - Ensure we have data before rendering */}
          {data.weaknesses && data.weaknesses.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-danger" />
                    Areas for Improvement
                  </h3>
                  <AlertTriangle className="h-5 w-5 text-danger" />
                </div>
                <div className="space-y-3">
                  {data.weaknesses.map((weakness, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg"
                    >
                      <AlertTriangle className="h-5 w-5 text-danger mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">
                        {weakness}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Nutrient Breakdown */}
        <div className="space-y-6">
          {/* Nutrient Breakdown - Ensure we have data before rendering */}

          {data?.nutrientBreakdown &&
          Object.keys(data.nutrientBreakdown).length > 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Daily Nutrient Intake
                </h3>
                <div className="space-y-4">
                  {Object.entries(data.nutrientBreakdown).map(
                    ([key, nutrient], index) => {
                      // Safely extract values
                      const nutrientData = nutrient || {};
                      const current = parseFloat(nutrientData.current) || 0;
                      const goal = parseFloat(nutrientData.goal) || 1; // Avoid division by zero
                      const unit = nutrientData.unit || "g";
                      const percentage = Math.round((current / goal) * 100);

                      // Get color based on percentage
                      let color = "gray";
                      let textColor = "text-gray-500";

                      if (percentage >= 90) {
                        color = "green";
                        textColor = "text-green-600 dark:text-green-400";
                      } else if (percentage >= 70) {
                        color = "yellow";
                        textColor = "text-yellow-600 dark:text-yellow-400";
                      } else {
                        color = "red";
                        textColor = "text-red-600 dark:text-red-400";
                      }

                      // Color mapping for progress bar
                      const colorMap = {
                        green: "#10b981",
                        yellow: "#f59e0b",
                        red: "#ef4444",
                        gray: "#6b7280",
                      };

                      // Format key for display (camelCase to Title Case)
                      const displayKey = key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim();

                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getNutrientIcon(key)}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                                {displayKey}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {current.toFixed(1)} / {goal.toFixed(1)} {unit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: colorMap[color],
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Daily Goal
                            </span>
                            <span
                              className={`text-xs font-medium ${textColor}`}
                            >
                              {percentage}%
                            </span>
                          </div>
                        </motion.div>
                      );
                    },
                  )}
                </div>
              </Card>
            </motion.div>
          ) : (
            // Optional: Show a placeholder when no data
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No nutrient data available. Start logging meals to see your
                    breakdown.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recommendations - Ensure we have data before rendering */}
          {data.recommendations && data.recommendations.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Recommendations
                  </h3>
                  <Brain className="h-5 w-5 text-primary-500" />
                </div>
                <div className="space-y-3">
                  {data.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary-500 mt-1.5"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {rec}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast.success("Saving recommendations to your plan...");
                    }}
                  >
                    Save to Action Plan
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Insights Section */}
      {insights && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary-500" />
                Personalized Insights for Your Goal
              </h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                {user?.goal || "maintain"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Foods */}
              {insights.recommended_foods &&
                insights.recommended_foods.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Recommended Foods
                    </h4>
                    <div className="space-y-2">
                      {insights.recommended_foods.map((food, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {food}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Exercise Recommendations */}
              {insights.exercise_recommendations && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Exercise Plan
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Cardio
                      </span>
                      <span className="font-semibold">
                        {insights.exercise_recommendations.cardio_minutes}{" "}
                        min/week
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Strength
                      </span>
                      <span className="font-semibold">
                        {insights.exercise_recommendations.strength_sessions}{" "}
                        sessions/week
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Intensity
                      </span>
                      <span className="font-semibold capitalize">
                        {insights.exercise_recommendations.intensity}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Focus and Tips */}
            {(insights.focus || insights.tip) && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.focus && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Current Focus
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {insights.focus}
                      </p>
                    </div>
                  )}
                  {insights.tip && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Expert Tip
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {insights.tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actionable Steps */}
            {insights.actionable_steps &&
              insights.actionable_steps.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Actionable Steps
                  </h4>
                  <div className="space-y-2">
                    {insights.actionable_steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="h-2 w-2 rounded-full bg-primary-500 mt-2"></div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </Card>
        </motion.div>
      )}

      {/* Trends Section */}
      {trends && trends.summary && Object.keys(trends.summary).length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Nutrition Trends (Last 30 Days)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {trends.summary.total_days || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Days Tracked
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(trends.summary.avg_daily_calories || 0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Avg. Daily Calories
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {trends.summary.avg_daily_meals?.toFixed(1) || "3.0"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Avg. Meals per Day
                </div>
              </div>
            </div>

            {trends.weekly_data && trends.weekly_data.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Weekly Overview
                </h4>
                <div className="space-y-3">
                  {trends.weekly_data.slice(-4).map((week, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Week {trends.weekly_data.length - index}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {week.days} days tracked
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {Math.round(week.calories / week.days)} cal/day
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {Math.round(week.protein / week.days)}g protein
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Debug Info (Remove in production) */}
    
    </motion.div>
  );
};

export default NutritionAnalysis;

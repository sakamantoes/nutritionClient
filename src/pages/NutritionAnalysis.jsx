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
  Activity,
  ChevronDown,
  ChevronUp,
  Filter,
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    strengths: true,
    weaknesses: true,
    nutrients: true,
    recommendations: true,
    insights: true,
    trends: true,
  });

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
    }
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
    }
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
    }
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center w-full max-w-sm">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Analyzing your nutrition data...
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
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
        return <Beef className="h-3 w-3 sm:h-4 sm:w-4" />;
      case "carbs":
        return <Wheat className="h-3 w-3 sm:h-4 sm:w-4" />;
      case "fat":
        return <Droplets className="h-3 w-3 sm:h-4 sm:w-4" />;
      case "fiber":
        return <Apple className="h-3 w-3 sm:h-4 sm:w-4" />;
      case "sugar":
        return <Apple className="h-3 w-3 sm:h-4 sm:w-4" />;
      case "sodium":
        return <Scale className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <Flame className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6"
    >
      {/* Header - Responsive */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-500" />
            Nutrition Analysis
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            AI-powered insights into your eating habits
          </p>
        </div>
        
        {/* Desktop Buttons - Hidden on Mobile */}
        <div className="hidden sm:flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAnalysis}
            loading={analysisLoading || insightsLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Mobile Header Buttons */}
        <div className="flex sm:hidden items-center justify-between">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            {showMobileFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handleRefreshAnalysis}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleExportReport}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Filters Dropdown */}
      {showMobileFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="sm:hidden"
        >
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {["day", "week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range);
                    setShowMobileFilters(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeRange === range
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Calendar className="h-3 w-3 mr-1" />
              {data.analysis?.daysAnalyzed || 7} days analyzed
            </div>
          </Card>
        </motion.div>
      )}

      {/* Desktop Time Range Selector - Hidden on Mobile */}
      <motion.div variants={itemVariants} className="hidden sm:block">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {["day", "week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    timeRange === range
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {data.analysis?.daysAnalyzed || 7} days analyzed
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Overall Score - Responsive */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                Your Nutrition Score
              </h2>
              <p className="text-xs sm:text-sm opacity-90 max-w-md">
                Based on analysis of {data.analysis?.totalMeals || 0} meals over{" "}
                {data.analysis?.daysAnalyzed || 7} days
              </p>
              {/* Legend - Hidden on Mobile, visible on Tablet/Desktop */}
              <div className="hidden sm:flex items-center space-x-4 mt-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs">Excellent (8-10)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-xs">Good (6-7.9)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-xs">Needs Improvement (0-5.9)</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-bold">
                {data.overallScore?.toFixed(1) || 7.8}
              </div>
              <div className="text-sm sm:text-lg opacity-90">out of 10</div>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm px-2 py-1 bg-white/20 rounded-full">
                {data.overallScore >= 8
                  ? "Excellent"
                  : data.overallScore >= 6
                    ? "Good"
                    : "Needs Improvement"}
              </div>
              {/* Mobile Legend - Only visible on mobile */}
              <div className="flex sm:hidden items-center justify-center space-x-2 mt-3">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs">8-10</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mr-1"></div>
                  <span className="text-xs">6-7.9</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs">0-5.9</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats - Responsive Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Calorie Balance
                </p>
                <p
                  className={`text-lg sm:text-2xl font-bold ${
                    data.analysis?.calorieBalance > 0 
                      ? "text-danger" 
                      : "text-success"
                  }`}
                >
                  {data.analysis?.calorieBalance > 0 ? "+" : ""}
                  {data.analysis?.calorieBalance || -120}
                </p>
              </div>
              <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Avg. Meals/Day
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {data.analysis?.totalMeals && data.analysis?.daysAnalyzed
                    ? (
                        data.analysis.totalMeals / data.analysis.daysAnalyzed
                      ).toFixed(1)
                    : "3.0"}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Processed Foods
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {data.analysis?.processedFoodPercentage || 18}%
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Hydration
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {data.analysis?.hydrationScore?.toFixed(1) || 8.2}/10
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Strengths & Weaknesses */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Strengths */}
          {data.strengths && data.strengths.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6">
                <div 
                  className="flex items-center justify-between mb-4 sm:mb-6 cursor-pointer lg:cursor-default"
                  onClick={() => toggleSection('strengths')}
                >
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-success" />
                    Strengths
                  </h3>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success mr-2 hidden sm:block" />
                    <button className="lg:hidden">
                      {expandedSections.strengths ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Collapsible content for mobile */}
                <div className={`${expandedSections.strengths ? 'block' : 'hidden lg:block'}`}>
                  <div className="space-y-2 sm:space-y-3">
                    {data.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-success-50 dark:bg-success-900/20 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success mt-0.5 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {strength}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Weaknesses */}
          {data.weaknesses && data.weaknesses.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6">
                <div 
                  className="flex items-center justify-between mb-4 sm:mb-6 cursor-pointer lg:cursor-default"
                  onClick={() => toggleSection('weaknesses')}
                >
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-danger" />
                    Areas for Improvement
                  </h3>
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-danger mr-2 hidden sm:block" />
                    <button className="lg:hidden">
                      {expandedSections.weaknesses ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Collapsible content for mobile */}
                <div className={`${expandedSections.weaknesses ? 'block' : 'hidden lg:block'}`}>
                  <div className="space-y-2 sm:space-y-3">
                    {data.weaknesses.map((weakness, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg"
                      >
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-danger mt-0.5 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {weakness}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Nutrient Breakdown & Recommendations */}
        <div className="space-y-4 sm:space-y-6">
          {/* Nutrient Breakdown */}
          {data?.nutrientBreakdown &&
          Object.keys(data.nutrientBreakdown).length > 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6">
                <div 
                  className="flex items-center justify-between mb-4 sm:mb-6 cursor-pointer lg:cursor-default"
                  onClick={() => toggleSection('nutrients')}
                >
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Daily Nutrients
                  </h3>
                  <button className="lg:hidden">
                    {expandedSections.nutrients ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Collapsible content for mobile */}
                <div className={`${expandedSections.nutrients ? 'block' : 'hidden lg:block'}`}>
                  <div className="space-y-3 sm:space-y-4">
                    {Object.entries(data.nutrientBreakdown).map(
                      ([key, nutrient], index) => {
                        const nutrientData = nutrient || {};
                        const current = parseFloat(nutrientData.current) || 0;
                        const goal = parseFloat(nutrientData.goal) || 1;
                        const unit = nutrientData.unit || "g";
                        const percentage = Math.round((current / goal) * 100);

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

                        const colorMap = {
                          green: "#10b981",
                          yellow: "#f59e0b",
                          red: "#ef4444",
                          gray: "#6b7280",
                        };

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
                            className="space-y-1 sm:space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getNutrientIcon(key)}
                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 ml-1 sm:ml-2">
                                  {displayKey}
                                </span>
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                {current.toFixed(1)} / {goal.toFixed(1)} {unit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                              <div
                                className="h-1.5 sm:h-2 rounded-full transition-all duration-500"
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
                      }
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6">
                <div className="text-center py-4 sm:py-8">
                  <Activity className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-2 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    No nutrient data available. Start logging meals to see your breakdown.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6">
                <div 
                  className="flex items-center justify-between mb-4 sm:mb-6 cursor-pointer lg:cursor-default"
                  onClick={() => toggleSection('recommendations')}
                >
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Recommendations
                  </h3>
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-2 hidden sm:block" />
                    <button className="lg:hidden">
                      {expandedSections.recommendations ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Collapsible content for mobile */}
                <div className={`${expandedSections.recommendations ? 'block' : 'hidden lg:block'}`}>
                  <div className="space-y-2 sm:space-y-3">
                    {data.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                      >
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary-500 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {rec}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                      onClick={() => {
                        toast.success("Saving recommendations to your plan...");
                      }}
                    >
                      Save to Action Plan
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Insights Section - Responsive */}
      {insights && (
        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6">
            <div 
              className="flex items-center justify-between mb-4 sm:mb-6 cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('insights')}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-500" />
                Personalized Insights
              </h3>
              <div className="flex items-center">
                <span className="hidden sm:block px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100 mr-2">
                  {user?.goal || "maintain"}
                </span>
                <button className="lg:hidden">
                  {expandedSections.insights ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Mobile Goal Badge */}
            <div className="sm:hidden mb-4">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                Goal: {user?.goal || "maintain"}
              </span>
            </div>
            
            {/* Collapsible content for mobile */}
            <div className={`${expandedSections.insights ? 'block' : 'hidden lg:block'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Recommended Foods */}
                {insights.recommended_foods &&
                  insights.recommended_foods.length > 0 && (
                    <div>
                      <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                        Recommended Foods
                      </h4>
                      <div className="space-y-1 sm:space-y-2">
                        {insights.recommended_foods.slice(0, 6).map((food, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
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
                    <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      Exercise Plan
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Cardio
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {insights.exercise_recommendations.cardio_minutes} min/week
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Strength
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {insights.exercise_recommendations.strength_sessions} sessions/week
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Intensity
                        </span>
                        <span className="text-xs sm:text-sm font-semibold capitalize">
                          {insights.exercise_recommendations.intensity.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Focus and Tips */}
              {(insights.focus || insights.tip) && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {insights.focus && (
                      <div>
                        <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                          Current Focus
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {insights.focus}
                        </p>
                      </div>
                    )}
                    {insights.tip && (
                      <div>
                        <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                          Expert Tip
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
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
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      Actionable Steps
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {insights.actionable_steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary-500 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Trends Section - Responsive */}
      {trends && trends.summary && Object.keys(trends.summary).length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-4 sm:p-6">
            <div 
              className="flex items-center justify-between mb-4 sm:mb-6 cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('trends')}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Nutrition Trends (30 Days)
              </h3>
              <button className="lg:hidden">
                {expandedSections.trends ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Collapsible content for mobile */}
            <div className={`${expandedSections.trends ? 'block' : 'hidden lg:block'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {trends.summary.total_days || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Days Tracked
                  </div>
                </div>

                <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.round(trends.summary.avg_daily_calories || 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Avg. Daily Calories
                  </div>
                </div>

                <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {trends.summary.avg_daily_meals?.toFixed(1) || "3.0"}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Avg. Meals per Day
                  </div>
                </div>
              </div>

              {trends.weekly_data && trends.weekly_data.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">
                    Weekly Overview
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {trends.weekly_data.slice(-4).map((week, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="mb-2 sm:mb-0">
                          <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                            Week {trends.weekly_data.length - index}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {week.days} days tracked
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                          <div className="text-right">
                            <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                              {Math.round(week.calories / week.days)} cal/day
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {Math.round(week.protein / week.days)}g protein
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NutritionAnalysis;
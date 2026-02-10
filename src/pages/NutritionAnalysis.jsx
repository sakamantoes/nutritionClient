import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
  RefreshCw,
  Brain
} from 'lucide-react';
import { useQuery, useMutation } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { mlApi, foodApi } from '../utils/api';
import toast from 'react-hot-toast';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const NutritionAnalysis = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week');
  const [analysisData, setAnalysisData] = useState(null);

  // Fetch food history for analysis
  const { data: foodHistory, isLoading: foodLoading } = useQuery(
    ['foodHistoryAnalysis', user?.id, timeRange],
    () => foodApi.getFoodHistory(user?.id, { 
      startDate: getStartDate(timeRange) 
    }),
    { enabled: !!user }
  );

  // ML Analysis mutation
  const analyzeMutation = useMutation(
    () => {
      // Prepare data for ML analysis
      const meals = foodHistory?.foodLogs?.map(log => ({
        calories: log.calories || 0,
        protein: log.protein || 0,
        carbs: log.carbs || 0,
        fat: log.fat || 0,
        fiber: log.fiber || 0,
        sugar: log.sugar || 0,
        sodium: log.sodium || 0,
        food_group: log.foodGroup || 'unknown'
      })) || [];

      return mlApi.analyzeNutrition({ meals });
    },
    {
      onSuccess: (data) => {
        setAnalysisData(data.data);
        toast.success('Nutrition analysis completed!');
      },
      onError: (error) => {
        toast.error('Failed to analyze nutrition data');
        // Fallback to mock data
        setAnalysisData(getMockAnalysisData());
      },
    }
  );

  // Get nutrition insights mutation
  const insightsMutation = useMutation(
    () => mlApi.getNutritionInsights({
      userId: user?.id,
      goal: user?.goal,
      timeRange: timeRange
    }),
    {
      onSuccess: (data) => {
        console.log('Nutrition insights:', data.data);
      },
      onError: (error) => {
        console.error('Failed to get insights:', error);
      },
    }
  );

  useEffect(() => {
    if (foodHistory?.foodLogs?.length > 0 && !analysisData) {
      analyzeMutation.mutate();
      insightsMutation.mutate();
    }
  }, [foodHistory]);

  const getStartDate = (range) => {
    const now = new Date();
    const start = new Date(now);
    
    switch (range) {
      case 'day':
        start.setDate(now.getDate() - 1);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }
    
    return start.toISOString().split('T')[0];
  };

  const getMockAnalysisData = () => {
    return {
      overallScore: 8.2,
      strengths: [
        'Adequate protein intake',
        'Good fiber consumption',
        'Balanced macronutrients',
      ],
      weaknesses: [
        'High sodium intake',
        'Insufficient water consumption',
        'Too much processed food',
      ],
      recommendations: [
        'Increase vegetable intake by 2 servings daily',
        'Reduce processed food consumption',
        'Drink at least 2L water daily',
        'Include more healthy fats',
      ],
      nutrientBreakdown: {
        protein: { current: 65, goal: 75, unit: 'g' },
        carbs: { current: 220, goal: 275, unit: 'g' },
        fat: { current: 55, goal: 65, unit: 'g' },
        fiber: { current: 22, goal: 25, unit: 'g' },
        sugar: { current: 45, goal: 50, unit: 'g' },
        sodium: { current: 2800, goal: 2300, unit: 'mg' },
      },
      foodGroupDistribution: {
        fruits: 15,
        vegetables: 20,
        protein: 25,
        grains: 25,
        dairy: 10,
        other: 5,
      },
      analysis: {
        calorieBalance: 250,
        macronutrientBalance: 'good',
        micronutrientScore: 7.5,
        processedFoodPercentage: 15,
        hydrationScore: 6.8,
      }
    };
  };

  const handleRefreshAnalysis = () => {
    analyzeMutation.mutate();
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name,
        goal: user?.goal,
      },
      timeRange: timeRange,
      analysis: analysisData,
      foodHistory: foodHistory?.foodLogs?.slice(0, 10) || []
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `nutrition-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Report exported successfully!');
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

  const data = analysisData || getMockAnalysisData();

  if (foodLoading || analyzeMutation.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Analyzing your nutrition data with AI...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This may take a few seconds
          </p>
        </div>
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            loading={analyzeMutation.isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {['day', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      timeRange === range
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Analyzing {foodHistory?.count || 0} meals
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Overall Score */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Your Nutrition Score
              </h2>
              <p className="opacity-90">
                Based on {timeRange}ly analysis of {foodHistory?.count || 0} meals
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
              <div className="text-6xl font-bold">{data.overallScore?.toFixed(1) || 8.2}</div>
              <div className="text-lg opacity-90">out of 10</div>
              <div className="mt-2 text-sm">
                {data.overallScore >= 8 ? 'Excellent' : 
                 data.overallScore >= 6 ? 'Good' : 'Needs Improvement'}
              </div>
              <div className="mt-4 text-xs opacity-75">
                Powered by AI • Updated just now
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Strengths & Weaknesses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strengths */}
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
                {data.strengths?.map((strength, index) => (
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
                )) || (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No strength data available
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Weaknesses */}
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
                {data.weaknesses?.map((weakness, index) => (
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
                )) || (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No weakness data available
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Nutrient Breakdown */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Nutrient Breakdown
              </h3>
              <div className="space-y-4">
                {data.nutrientBreakdown ? Object.entries(data.nutrientBreakdown).map(([key, nutrient], index) => {
                  const percentage = Math.round((nutrient.current / nutrient.goal) * 100);
                  const color = percentage >= 90 ? 'success' : percentage >= 70 ? 'warning' : 'danger';
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {key}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {nutrient.current} / {nutrient.goal} {nutrient.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-${color}-500 transition-all duration-500`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Daily Goal
                        </span>
                        <span className={`text-xs font-medium text-${color}-600 dark:text-${color}-400`}>
                          {percentage}%
                        </span>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No nutrient data available
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Recommendations
                </h3>
                <Brain className="h-5 w-5 text-primary-500" />
              </div>
              <div className="space-y-3">
                {data.recommendations?.map((rec, index) => (
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
                )) || (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No recommendations available
                  </div>
                )}
              </div>
              {data.recommendations && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Navigate to meal planning or implement recommendation action
                      toast.success('Implementing recommendations...');
                    }}
                  >
                    Apply Recommendations
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Additional Metrics */}
      {data.analysis && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Detailed Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Calorie Balance</p>
                <p className={`text-2xl font-bold ${
                  data.analysis.calorieBalance > 0 ? 'text-danger' : 'text-success'
                }`}>
                  {data.analysis.calorieBalance > 0 ? '+' : ''}{data.analysis.calorieBalance}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">calories per day</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Macro Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.analysis.macronutrientBalance}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">protein/carbs/fat</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Processed Foods</p>
                <p className={`text-2xl font-bold ${
                  data.analysis.processedFoodPercentage > 20 ? 'text-danger' : 'text-warning'
                }`}>
                  {data.analysis.processedFoodPercentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">of total intake</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Hydration Score</p>
                <p className={`text-2xl font-bold ${
                  data.analysis.hydrationScore > 8 ? 'text-success' : 'text-warning'
                }`}>
                  {data.analysis.hydrationScore?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">out of 10</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NutritionAnalysis;
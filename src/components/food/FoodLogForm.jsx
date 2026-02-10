// src/components/food/FoodLogForm.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  Scale, 
  Calendar,
  Coffee,
  Sandwich,
  Utensils,
  Apple
} from 'lucide-react';
import { format } from 'date-fns';
import { foodApi } from '../../utils/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const FoodLogForm = ({ food, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    foodName: '',
    foodGroup: 'fruits',
    servingSize: 100,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    mealType: 'breakfast',
    timestamp: new Date().toISOString(),
  });

  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (food) {
      setFormData({
        foodName: food.foodName || food.food_name || '',
        foodGroup: food.foodGroup || food.food_group || 'fruits',
        servingSize: food.servingSize || food.serving_size_g || 100,
        calories: food.calories || food.energy_kcal || 0,
        protein: food.protein || food.protein_g || 0,
        carbs: food.carbs || food.carbohydrates_g || 0,
        fat: food.fat || food.total_fat_g || 0,
        fiber: food.fiber || food.fiber_g || 0,
        sugar: food.sugar || food.sugars_g || 0,
        sodium: food.sodium || food.sodium_mg || 0,
        mealType: food.mealType || 'breakfast',
        timestamp: food.timestamp || new Date().toISOString(),
      });
    }
  }, [food]);

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'yellow' },
    { id: 'lunch', label: 'Lunch', icon: Sandwich, color: 'blue' },
    { id: 'dinner', label: 'Dinner', icon: Utensils, color: 'purple' },
    { id: 'snack', label: 'Snack', icon: Apple, color: 'green' },
  ];

  const foodGroups = [
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'meat', label: 'Meat' },
    { id: 'fish', label: 'Fish' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'legumes', label: 'Legumes' },
    { id: 'cereals', label: 'Cereals' },
    { id: 'fats_oils', label: 'Fats & Oils' },
    { id: 'processed', label: 'Processed' },
  ];

  const handlePredict = async () => {
    if (!formData.foodName) return;

    setPredicting(true);
    try {
      const nutritionData = {
        energy_kcal: formData.calories,
        carbohydrates_g: formData.carbs,
        protein_g: formData.protein,
        total_fat_g: formData.fat,
        fiber_g: formData.fiber,
        sugars_g: formData.sugar,
        sodium_mg: formData.sodium,
      };

      const [groupResponse, scoreResponse] = await Promise.all([
        mlApi.predictFoodGroup(nutritionData),
        mlApi.predictHealthScore({
          ...nutritionData,
          saturated_fat_g: 0,
          unsaturated_fat_g: 0,
          trans_fat_g: 0,
          vitamin_C_percent_DV: 0,
          calcium_percent_DV: 0,
          iron_percent_DV: 0,
          potassium_mg: 0,
        }),
      ]);

      setFormData(prev => ({
        ...prev,
        foodGroup: groupResponse.data.prediction,
      }));

      alert(`Predicted Food Group: ${groupResponse.data.prediction}\nHealth Score: ${scoreResponse.data.health_score.toFixed(1)}/10`);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {food ? 'Edit Food' : 'Add Food'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Food Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Food Name *</label>
              <Input
                type="text"
                value={formData.foodName}
                onChange={(e) => handleChange('foodName', e.target.value)}
                placeholder="e.g., Grilled Chicken Breast"
                required
              />
            </div>

            <div>
              <label className="label">Food Group</label>
              <select
                value={formData.foodGroup}
                onChange={(e) => handleChange('foodGroup', e.target.value)}
                className="input"
              >
                {foodGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nutrition Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nutrition Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Calories</label>
                <Input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => handleChange('calories', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="label">Protein (g)</label>
                <Input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => handleChange('protein', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="label">Carbs (g)</label>
                <Input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => handleChange('carbs', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="label">Fat (g)</label>
                <Input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => handleChange('fat', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="label">Fiber (g)</label>
                <Input
                  type="number"
                  value={formData.fiber}
                  onChange={(e) => handleChange('fiber', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="label">Sugar (g)</label>
                <Input
                  type="number"
                  value={formData.sugar}
                  onChange={(e) => handleChange('sugar', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="label">Sodium (mg)</label>
                <Input
                  type="number"
                  value={formData.sodium}
                  onChange={(e) => handleChange('sodium', parseFloat(e.target.value))}
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="label">Serving Size (g)</label>
                <Input
                  type="number"
                  value={formData.servingSize}
                  onChange={(e) => handleChange('servingSize', parseFloat(e.target.value))}
                  min="1"
                  step="1"
                />
              </div>
            </div>
          </div>

          {/* Meal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Meal Type</label>
              <div className="grid grid-cols-2 gap-2">
                {mealTypes.map((meal) => (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => handleChange('mealType', meal.id)}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      formData.mealType === meal.id
                        ? `border-${meal.color}-500 bg-${meal.color}-50 dark:bg-${meal.color}-900/20 text-${meal.color}-600 dark:text-${meal.color}-400`
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <meal.icon className="h-4 w-4" />
                    <span>{meal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Date & Time</label>
              <Input
                type="datetime-local"
                value={format(new Date(formData.timestamp), "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => handleChange('timestamp', new Date(e.target.value).toISOString())}
              />
            </div>
          </div>

          {/* AI Prediction Button */}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handlePredict}
              disabled={predicting || !formData.foodName}
              className="w-full"
            >
              {predicting ? 'Predicting...' : 'Predict Food Group with AI'}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Uses machine learning to predict food group based on nutrition values
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={!formData.foodName || !formData.calories}
              className='text-white bg-green-500'
            >
              {food ? 'Update' : 'Add'} Food
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FoodLogForm;
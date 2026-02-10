// src/components/exercise/ExerciseForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Clock, 
  Dumbbell, 
  Activity,
  PersonStanding,
  Calendar,
  Flame
} from 'lucide-react';
import { format } from 'date-fns';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const ExerciseForm = ({ exercise, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    exerciseName: '',
    duration: 30,
    caloriesBurned: 200,
    exerciseType: 'cardio',
    timestamp: new Date().toISOString(),
  });

  const exerciseTypes = [
    { id: 'cardio', label: 'Cardio', icon: Activity, color: 'red', description: 'Running, cycling, swimming' },
    { id: 'strength', label: 'Strength', icon: Dumbbell, color: 'blue', description: 'Weight lifting, resistance training' },
    { id: 'flexibility', label: 'Flexibility', icon: PersonStanding, color: 'green', description: 'Yoga, stretching, pilates' },
  ];

  const commonExercises = [
    { name: 'Running', type: 'cardio', caloriesPerMin: 10 },
    { name: 'Cycling', type: 'cardio', caloriesPerMin: 8 },
    { name: 'Swimming', type: 'cardio', caloriesPerMin: 11 },
    { name: 'Weight Lifting', type: 'strength', caloriesPerMin: 5 },
    { name: 'Yoga', type: 'flexibility', caloriesPerMin: 3 },
    { name: 'HIIT', type: 'cardio', caloriesPerMin: 12 },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate calories for common exercises
    if (field === 'exerciseName') {
      const foundExercise = commonExercises.find(e => e.name === value);
      if (foundExercise) {
        setFormData(prev => ({
          ...prev,
          exerciseType: foundExercise.type,
          caloriesBurned: Math.round(foundExercise.caloriesPerMin * prev.duration),
        }));
      }
    }

    // Recalculate calories when duration changes
    if (field === 'duration') {
      const foundExercise = commonExercises.find(e => e.name === formData.exerciseName);
      if (foundExercise) {
        setFormData(prev => ({
          ...prev,
          caloriesBurned: Math.round(foundExercise.caloriesPerMin * value),
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {exercise ? 'Edit Exercise' : 'Log Exercise'}
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
          {/* Exercise Name */}
          <div>
            <label className="label">Exercise Name *</label>
            <select
              value={formData.exerciseName}
              onChange={(e) => handleChange('exerciseName', e.target.value)}
              className="input"
              required
            >
              <option value="">Select an exercise</option>
              {commonExercises.map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name}
                </option>
              ))}
              <option value="custom">Custom Exercise</option>
            </select>
            
            {formData.exerciseName === 'custom' && (
              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Enter custom exercise name"
                  value={formData.customName || ''}
                  onChange={(e) => handleChange('customName', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Exercise Type */}
          <div>
            <label className="label">Exercise Type</label>
            <div className="grid grid-cols-3 gap-3">
              {exerciseTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleChange('exerciseType', type.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                    formData.exerciseType === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20 text-${type.color}-600 dark:text-${type.color}-400`
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <type.icon className="h-5 w-5 mb-2" />
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {type.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Calories */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Duration (minutes)
                </div>
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                min="1"
                max="300"
                required
              />
            </div>
            <div>
              <label className="label">
                <div className="flex items-center">
                  <Flame className="h-4 w-4 mr-2" />
                  Calories Burned
                </div>
              </label>
              <Input
                type="number"
                value={formData.caloriesBurned}
                onChange={(e) => handleChange('caloriesBurned', parseInt(e.target.value))}
                min="1"
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="label">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Date & Time
              </div>
            </label>
            <Input
              type="datetime-local"
              value={format(new Date(formData.timestamp), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => handleChange('timestamp', new Date(e.target.value).toISOString())}
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="label">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    exerciseName: 'Running',
                    duration: 30,
                    caloriesBurned: 300,
                    exerciseType: 'cardio',
                  });
                }}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                30min Run
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    exerciseName: 'Weight Lifting',
                    duration: 45,
                    caloriesBurned: 225,
                    exerciseType: 'strength',
                  });
                }}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                45min Weights
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    exerciseName: 'Yoga',
                    duration: 60,
                    caloriesBurned: 180,
                    exerciseType: 'flexibility',
                  });
                }}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                60min Yoga
              </button>
            </div>
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
            className='bg-green-500'
              type="submit"
              loading={isLoading}
              disabled={!formData.exerciseName || !formData.duration}
            >
              {exercise ? 'Update' : 'Log'} Exercise
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ExerciseForm;
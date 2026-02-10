// src/utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.length >= 2;
};

export const validateAge = (age) => {
  return age >= 1 && age <= 120;
};

export const validateWeight = (weight) => {
  return weight >= 20 && weight <= 300;
};

export const validateHeight = (height) => {
  return height >= 100 && height <= 250;
};

export const validateFoodEntry = (food) => {
  const errors = {};
  
  if (!food.foodName || food.foodName.trim().length === 0) {
    errors.foodName = 'Food name is required';
  }
  
  if (!food.calories || food.calories < 0) {
    errors.calories = 'Calories must be a positive number';
  }
  
  if (!food.servingSize || food.servingSize <= 0) {
    errors.servingSize = 'Serving size must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateExerciseEntry = (exercise) => {
  const errors = {};
  
  if (!exercise.exerciseName || exercise.exerciseName.trim().length === 0) {
    errors.exerciseName = 'Exercise name is required';
  }
  
  if (!exercise.duration || exercise.duration <= 0) {
    errors.duration = 'Duration must be greater than 0';
  }
  
  if (!exercise.caloriesBurned || exercise.caloriesBurned <= 0) {
    errors.caloriesBurned = 'Calories burned must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
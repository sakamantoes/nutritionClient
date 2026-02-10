// src/components/chatbot/QuickQuestions.jsx
import React from 'react';
import { motion } from 'framer-motion';

const QuickQuestions = ({ onSelect }) => {
  const questions = [
    "What's a healthy breakfast?",
    "How much protein do I need?",
    "Best foods for weight loss?",
    "How to read nutrition labels?",
    "Healthy snack ideas?",
    "How much water should I drink?",
    "Best time to exercise?",
    "How to boost metabolism?",
  ];

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Quick Questions
      </h4>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(question)}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
          >
            {question}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestions;
// src/components/common/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hoverable = false, 
  clickable = false,
  onClick,
  padding = 'p-6',
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {}}
      className={`
        bg-white dark:bg-gray-800 
        rounded-xl 
        shadow-lg 
        border border-gray-200 dark:border-gray-700 
        transition-all duration-200
        ${padding}
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
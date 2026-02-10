// src/components/common/ProgressCircle.jsx
import React from 'react';

const ProgressCircle = ({ 
  value = 0, 
  max = 100, 
  size = 100, 
  strokeWidth = 8,
  label,
  showValue = true,
  color = 'primary',
  className = '' 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    primary: {
      stroke: '#0ea5e9',
      bg: '#e0f2fe',
    },
    secondary: {
      stroke: '#d946ef',
      bg: '#fae8ff',
    },
    success: {
      stroke: '#10b981',
      bg: '#d1fae5',
    },
    warning: {
      stroke: '#f59e0b',
      bg: '#fef3c7',
    },
    danger: {
      stroke: '#ef4444',
      bg: '#fee2e2',
    },
  };

  const selectedColor = colors[color] || colors.primary;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={selectedColor.bg}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={selectedColor.stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {showValue && (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
// src/components/dashboard/NutritionChart.jsx
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const NutritionChart = ({ data }) => {
  // Use provided data or generate default
  const chartData = data || [
    { day: 'Mon', calories: 2200, protein: 65, carbs: 250, fat: 70 },
    { day: 'Tue', calories: 2100, protein: 70, carbs: 230, fat: 65 },
    { day: 'Wed', calories: 2300, protein: 75, carbs: 270, fat: 75 },
    { day: 'Thu', calories: 1900, protein: 60, carbs: 210, fat: 60 },
    { day: 'Fri', calories: 2400, protein: 80, carbs: 280, fat: 80 },
    { day: 'Sat', calories: 2600, protein: 85, carbs: 300, fat: 85 },
    { day: 'Sun', calories: 2000, protein: 70, carbs: 240, fat: 70 },
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              borderRadius: '0.5rem',
              color: '#FFFFFF',
            }}
            formatter={(value) => [value, value > 100 ? 'cal' : 'g']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Calories"
          />
          <Line
            type="monotone"
            dataKey="protein"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Protein (g)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutritionChart;
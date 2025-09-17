import React from 'react';
import { motion } from 'framer-motion';

// Add a prop for predictive analytics data
export interface ChartProps {
  type?: 'doughnut' | 'line' | 'bar';
  data?: any;
  predictiveAnalyticsData?: any; // Placeholder for AI analytics
}

const Chart: React.FC<ChartProps> = ({ type = 'doughnut', data, predictiveAnalyticsData }) => {
  const renderDoughnutChart = () => (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="8"
        />
        
        {/* Data segments */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="8"
          strokeDasharray="75.4 251.2"
          strokeDashoffset="0"
          initial={{ strokeDasharray: "0 251.2" }}
          animate={{ strokeDasharray: "75.4 251.2" }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#10b981"
          strokeWidth="8"
          strokeDasharray="62.8 251.2"
          strokeDashoffset="-75.4"
          initial={{ strokeDasharray: "0 251.2" }}
          animate={{ strokeDasharray: "62.8 251.2" }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="8"
          strokeDasharray="50.2 251.2"
          strokeDashoffset="-138.2"
          initial={{ strokeDasharray: "0 251.2" }}
          animate={{ strokeDasharray: "50.2 251.2" }}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">247</div>
          <div className="text-sm text-gray-500">Total Issues</div>
        </div>
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className="w-full h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="40"
            y1={40 + i * 32}
            x2="360"
            y2={40 + i * 32}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        <motion.polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points="40,160 80,120 120,140 160,100 200,80 240,90 280,60 320,70 360,50"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* Data points */}
        {[
          [40, 160], [80, 120], [120, 140], [160, 100], [200, 80],
          [240, 90], [280, 60], [320, 70], [360, 50]
        ].map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="#3b82f6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 + 0.5 }}
          />
        ))}
      </svg>
    </div>
  );

  const renderBarChart = () => (
    <div className="w-full h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Bars */}
        {[
          { x: 50, height: 120, color: '#3b82f6' },
          { x: 100, height: 80, color: '#10b981' },
          { x: 150, height: 100, color: '#f59e0b' },
          { x: 200, height: 60, color: '#ef4444' },
          { x: 250, height: 140, color: '#8b5cf6' },
          { x: 300, height: 90, color: '#06b6d4' }
        ].map((bar, i) => (
          <motion.rect
            key={i}
            x={bar.x}
            y={180 - bar.height}
            width="30"
            height={bar.height}
            fill={bar.color}
            rx="4"
            initial={{ height: 0, y: 180 }}
            animate={{ height: bar.height, y: 180 - bar.height }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );

  return (
    <div>
      {/* Existing chart rendering */}
      {type === 'doughnut' && renderDoughnutChart()}
      {type === 'line' && renderLineChart()}
      {type === 'bar' && renderBarChart()}

      {/* Predictive Analytics Section */}
      {predictiveAnalyticsData && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Predictive Analytics</h3>
          <pre className="text-xs text-gray-700">{JSON.stringify(predictiveAnalyticsData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Chart;
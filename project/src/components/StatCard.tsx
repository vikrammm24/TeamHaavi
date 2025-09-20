import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, onClick, className }) => {

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKey}
      aria-label={onClick ? `${title}: ${value}` : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg text-white`} style={{ background: 'linear-gradient(135deg, var(--bg3), var(--bg1))' }}>
          {icon}
        </div>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {change}
          </span>
        </div>
      </div>
      
      <div>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-gray-800 mb-1"
        >
          {value}
        </motion.h3>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
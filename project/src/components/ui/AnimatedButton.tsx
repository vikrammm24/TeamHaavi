import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'glass';
  glow?: boolean;
}

const variants = {
  primary: 'relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300',
  outline: 'relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold border border-blue-500/40 text-blue-600 dark:text-blue-300 hover:border-blue-500/70 transition-all duration-300',
  glass: 'relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-blue-700 dark:text-blue-200 bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/40 hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300'
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ variant = 'primary', glow = true, className = '', children, ...rest }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      className={`${variants[variant]} ${glow ? 'after:absolute after:inset-0 after:rounded-xl after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_60%)]' : ''} ${className}`}
      {...rest}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  shimmer?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverLift = true, shimmer = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverLift ? { y: -6 } : undefined}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`glass-surface cc-card-border rounded-2xl p-6 relative overflow-hidden ${className}`}
    >
      {shimmer && <div className="pointer-events-none absolute -inset-px opacity-0 hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;

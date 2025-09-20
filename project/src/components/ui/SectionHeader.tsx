import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, subtitle, align = 'center', className='' }) => {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center mx-auto max-w-3xl' : ''} ${className}`}> 
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent"
        >
          {eyebrow}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-2 text-3xl md:text-5xl font-bold cc-gradient-text"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeader;

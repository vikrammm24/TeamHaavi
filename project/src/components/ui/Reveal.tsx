import React from 'react';
import { motion } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  y?: number; // override base distance
  className?: string;
}

const getOffset = (direction: Direction, y?: number) => {
  const d = y ?? 24;
  switch (direction) {
    case 'up':
      return { x: 0, y: d };
    case 'down':
      return { x: 0, y: -d };
    case 'left':
      return { x: d, y: 0 };
    case 'right':
      return { x: -d, y: 0 };
    default:
      return { x: 0, y: 12 };
  }
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  y,
  className,
}) => {
  const offset = getOffset(direction, y);
  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;

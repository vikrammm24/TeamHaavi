import React from 'react';
import { motion, useScroll } from 'framer-motion';

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[60]"
      style={{
        background: 'linear-gradient(90deg, var(--bg3), var(--bg1))',
        scaleX: scrollYProgress,
        transformOrigin: '0% 50%'
      }}
    />
  );
};

export default ScrollProgress;

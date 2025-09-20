import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type DraggableFloatProps = {
  id: string;
  className?: string;
  children: React.ReactNode;
};

// Simple draggable wrapper for fixed-position floaters.
// Persists transform offsets in localStorage so position is remembered.
const DraggableFloat: React.FC<DraggableFloatProps> = ({ id, className = '', children }) => {
  const storageKey = `cc:float:${id}`;
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved?.x === 'number' && typeof saved?.y === 'number') {
          setPos({ x: saved.x, y: saved.y });
        }
      }
    } catch {}
  }, []);

  const save = (x: number, y: number) => {
    setPos({ x, y });
    try { localStorage.setItem(storageKey, JSON.stringify({ x, y })); } catch {}
  };

  return (
    <motion.div
      className={className}
      drag
      dragMomentum={false}
      dragElastic={0.12}
      style={{ x: pos.x, y: pos.y }}
      onDragEnd={(e, info) => {
        save(info.point.x - (e.target as HTMLElement).offsetLeft, info.point.y - (e.target as HTMLElement).offsetTop);
      }}
    >
      {children}
    </motion.div>
  );
};

export default DraggableFloat;

import React, { useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type PrimaryButtonProps = HTMLMotionProps<'button'> & { className?: string };

/**
 * PrimaryButton adds a subtle ripple effect + gradient background.
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = '', ...props }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (props.onClick) props.onClick(e);
    const el = ref.current;
    if (!el) return;
    // Create ripple element
    const ripple = document.createElement('span');
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.borderRadius = '9999px';
    ripple.style.opacity = '0.35';
    ripple.style.background = 'white';
    ripple.style.transform = 'scale(0)';
    ripple.style.pointerEvents = 'none';
    ripple.style.transition = 'transform 600ms ease, opacity 700ms ease';
    el.appendChild(ripple);
    // Kick off animation
    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(2.5)';
      ripple.style.opacity = '0';
    });
    setTimeout(() => ripple.remove(), 800);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={[
        'relative overflow-hidden select-none',
        'bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 text-white',
        'rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl',
        'transition-all duration-300',
        className
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default PrimaryButton;

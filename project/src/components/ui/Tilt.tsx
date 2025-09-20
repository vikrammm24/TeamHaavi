import React, { useEffect, useRef, useState } from 'react';

interface TiltProps {
  children: React.ReactNode;
  maxTilt?: number; // degrees
  scale?: number; // hover scale
  glare?: boolean;
  className?: string;
}

const Tilt: React.FC<TiltProps> = ({ children, maxTilt = 10, scale = 1.02, glare = false, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Disable on touch devices and when reduced motion is preferred
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqPointer = window.matchMedia('(pointer: fine)');
    const shouldEnable = mqPointer.matches && !mqMotion.matches;
    setEnabled(shouldEnable);
    const onChange = () => setEnabled(mqPointer.matches && !mqMotion.matches);
    mqMotion.addEventListener?.('change', onChange);
    mqPointer.addEventListener?.('change', onChange);
    return () => {
      mqMotion.removeEventListener?.('change', onChange);
      mqPointer.removeEventListener?.('change', onChange);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rx = (py - 0.5) * (2 * maxTilt);
      const ry = (0.5 - px) * (2 * maxTilt);
      el.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
      if (glare) {
        el.style.setProperty('--tilt-glare-x', `${px * 100}%`);
        el.style.setProperty('--tilt-glare-y', `${py * 100}%`);
      }
    };
    const handleLeave = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [enabled, maxTilt, scale, glare]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: 'transform 300ms var(--cc-transition, cubic-bezier(.4,.2,.2,1))',
        willChange: 'transform',
        position: 'relative',
      }}
    >
      {children}
      {glare && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient( circle at var(--tilt-glare-x, 50%) var(--tilt-glare-y, 50%), rgba(255,255,255,0.25), transparent 40% )',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            transition: 'opacity 300ms ease',
          }}
        />
      )}
    </div>
  );
};

export default Tilt;

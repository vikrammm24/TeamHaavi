import React from 'react';

interface AnimatedIconProps {
  children: React.ReactNode; // the icon
  size?: number; // px box size
  ring?: boolean;
  glow?: boolean;
  bob?: boolean;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ children, size = 52, ring = true, glow = true, bob = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center rounded-xl brand-icon ${glow ? 'cc-glow' : ''} ${bob ? 'cc-bob' : ''}`}
         style={{ width: size, height: size }}>
      {ring && <span className="cc-ring cc-spin-slow rounded-xl" aria-hidden />}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
      {/* orbiting dot */}
      <span className="absolute top-1/2 left-1/2 -ml-[1px] -mt-[1px] w-1.5 h-1.5 rounded-full bg-white/90 cc-orbit" aria-hidden />
    </div>
  );
};

export default AnimatedIcon;

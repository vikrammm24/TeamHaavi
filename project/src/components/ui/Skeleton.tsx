import React from 'react';

interface SkeletonProps {
  lines?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="cc-skeleton h-4 w-full" style={{ animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  );
};

export default Skeleton;

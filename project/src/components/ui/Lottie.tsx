import React from 'react';
import Lottie from 'lottie-react';

interface LottieProps {
  animationData: object;
  className?: string;
  loop?: boolean;
}

const LottiePlayer: React.FC<LottieProps> = ({ animationData, className, loop = true }) => {
  return (
    <Lottie animationData={animationData} loop={loop} className={className} />
  );
};

export default LottiePlayer;

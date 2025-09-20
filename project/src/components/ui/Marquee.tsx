import React, { useEffect, useRef, useState } from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speedSeconds?: number; // animation duration
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
}

// Renders an infinite seamless scrolling row using duplicated content
const Marquee: React.FC<MarqueeProps> = ({
  children,
  speedSeconds = 18,
  pauseOnHover = true,
  reverse = false,
  className = ''
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [useJs, setUseJs] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const cs = getComputedStyle(t);
    const animName = cs.animationName || '';
    // If CSS animation is missing or disabled, use JS fallback
    const shouldFallback = !animName || animName === 'none';
    setUseJs(shouldFallback);
    // Force-restart CSS animation to prevent stalling after hydration/visibility changes
    t.style.animation = 'none';
    // Apply inline duration to guarantee speedSeconds is honored
    t.style.animationDuration = `${speedSeconds}s`;
    // Trigger reflow
    void t.offsetHeight;
    t.style.animation = '';
  }, [speedSeconds]);

  useEffect(() => {
    if (!useJs) return;
    const el = trackRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    // disable CSS animation
    el.style.animation = 'none';
    let raf = 0;
    let x = 0; // px offset
    const step = () => {
      if (!wrap || !el) return;
      if (!pausedRef.current) {
        const total = el.scrollWidth / 2; // one loop distance
        // pixels per second = total / speedSeconds
        const pps = total / Math.max(0.001, speedSeconds);
        const delta = pps / 60; // approx 60fps
        x += (reverse ? delta : -delta);
        // wrap around
        if (x <= -total) x += total;
        if (x >= 0) x -= total;
        el.style.transform = `translateX(${Math.round(x)}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const onEnter = () => { if (pauseOnHover) pausedRef.current = true; };
    const onLeave = () => { if (pauseOnHover) pausedRef.current = false; };
    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
    return () => { cancelAnimationFrame(raf); wrap.removeEventListener('mouseenter', onEnter); wrap.removeEventListener('mouseleave', onLeave); };
  }, [useJs, speedSeconds, reverse, pauseOnHover]);

  return (
    <div ref={wrapRef} className={`marquee ${className}`} style={{ ['--marquee-duration' as any]: `${speedSeconds}s` }}>
      <div ref={trackRef} className={`marquee__track ${pauseOnHover ? 'pause-on-hover' : ''} ${reverse ? 'reverse' : ''}`}>
        <div className="flex items-center gap-8 px-6 py-2">
          {children}
        </div>
        <div className="flex items-center gap-8 px-6 py-2" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Marquee;

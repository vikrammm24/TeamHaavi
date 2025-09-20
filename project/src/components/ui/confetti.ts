export interface ConfettiOptions {
  particles?: number;
  durationMs?: number;
}

export function fireConfetti(opts: ConfettiOptions = {}) {
  const particles = Math.max(40, Math.min(200, opts.particles ?? 80));
  const duration = Math.max(600, Math.min(3000, opts.durationMs ?? 1200));

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  };
  resize();
  const onResize = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    resize();
  };
  window.addEventListener('resize', onResize);

  const colors = ['#22c55e', '#06b6d4', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];
  const confetti = Array.from({ length: particles }).map(() => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * 80,
    size: 6 + Math.random() * 6,
    speedY: 2 + Math.random() * 3,
    speedX: -1 + Math.random() * 2,
    rot: Math.random() * Math.PI,
    rotSpeed: -0.2 + Math.random() * 0.4,
    color: colors[(Math.random() * colors.length) | 0],
  }));

  const start = performance.now();
  function tick(t: number) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // fade out towards the end
    const alpha = 1 - Math.min(1, Math.max(0, (elapsed - duration * 0.7) / (duration * 0.3)));
    ctx.globalAlpha = Math.max(0, alpha);
    confetti.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      // draw rectangle as confetti piece
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (elapsed < duration) requestAnimationFrame(tick);
    else cleanup();
  }

  function cleanup() {
    window.removeEventListener('resize', onResize);
    canvas.remove();
  }

  requestAnimationFrame(tick);
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: 'cyan' | 'magenta' | 'lime';
};

const COLORS: Record<Particle['hue'], string> = {
  cyan: 'rgba(0, 251, 251, 0.85)',
  magenta: 'rgba(254, 0, 254, 0.85)',
  lime: 'rgba(117, 255, 104, 0.85)',
};

export type ParticleLayer = {
  burstAt: (clientX: number, clientY: number, intensity?: number) => void;
  destroy: () => void;
};

export function startParticleLayer(host: HTMLElement): ParticleLayer {
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  host.append(canvas);

  const ctx = canvas.getContext('2d');
  const particles: Particle[] = [];
  let rafId = 0;
  let running = true;

  const syncSize = (): void => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
  resizeObserver?.observe(host);
  syncSize();

  const spawnBurst = (clientX: number, clientY: number, intensity = 1): void => {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const count = Math.round(10 + intensity * 6);
    const hues: Particle['hue'][] = ['cyan', 'magenta', 'lime'];

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 4) * intensity;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.35,
        size: 3 + Math.random() * 5 * intensity,
        hue: hues[i % hues.length]!,
      });
    }
  };

  const tick = (): void => {
    if (!running || !ctx) return;
    if (!resizeObserver) syncSize();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i]!;
      p.life += 1 / 60;
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        continue;
      }

      p.vx *= 0.96;
      p.vy *= 0.96;
      p.vy += 0.04;
      p.x += p.vx;
      p.y += p.vy;

      const t = 1 - p.life / p.maxLife;
      ctx.globalAlpha = t * 0.9;
      ctx.fillStyle = COLORS[p.hue];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return {
    burstAt(clientX: number, clientY: number, intensity = 1): void {
      spawnBurst(clientX, clientY, intensity);
    },
    destroy(): void {
      running = false;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      canvas.remove();
    },
  };
}

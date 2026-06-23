import { startParticleLayer, type ParticleLayer } from './particles';
import { startShaderLayer, type ShaderLayer } from './shader-bg';

/** Background → Shader → Bubbles → Particles → UI layer orchestration. */
export type VisualStack = {
  popAt: (clientX: number, clientY: number, comboMultiplier?: number) => void;
  destroy: () => void;
};

export function attachVisualStack(section: HTMLElement): VisualStack {
  const shaderHost = section.querySelector<HTMLElement>('.visual-layer-shader');
  const particleHost = section.querySelector<HTMLElement>('.visual-layer-particles');

  const shader: ShaderLayer | null = shaderHost ? startShaderLayer(shaderHost) : null;
  const particles: ParticleLayer | null = particleHost
    ? startParticleLayer(particleHost)
    : null;

  return {
    popAt(clientX: number, clientY: number, comboMultiplier = 1): void {
      shader?.popAt(clientX, clientY);
      const intensity = Math.min(2.5, 0.75 + comboMultiplier * 0.15);
      particles?.burstAt(clientX, clientY, intensity);
    },
    destroy(): void {
      shader?.destroy();
      particles?.destroy();
    },
  };
}

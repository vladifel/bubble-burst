const VERTEX_SHADER = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pop_uv;
uniform float u_pop_t;

void main() {
  vec2 uv = v_texCoord;
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(uv, center);

  float speed = 4.0;
  float frequency = 25.0;
  float amplitude = 0.035;
  float decay = exp(-dist * 5.0);
  float wave = sin(dist * frequency - u_time * speed) * amplitude * decay;

  float popActive = step(u_pop_t, 1.4);
  float popDist = distance(uv, u_pop_uv);
  float popWave = sin(popDist * 55.0 - u_pop_t * 14.0) * 0.14
    * exp(-popDist * 7.0) * exp(-u_pop_t * 3.5) * popActive;
  wave += popWave;

  vec3 colorA = vec3(0.0, 1.0, 1.0);
  vec3 colorB = vec3(1.0, 0.0, 1.0);
  float glow = smoothstep(0.12, 0.0, abs(dist - 0.22)) * 0.45;
  vec3 finalColor = mix(colorA, colorB, sin(u_time + dist * 10.0) * 0.5 + 0.5);
  finalColor *= glow * decay;

  float popGlow = exp(-popDist * 5.0) * exp(-u_pop_t * 4.0) * popActive * 0.6;
  finalColor += mix(colorA, colorB, 0.5) * popGlow;

  float sparkles = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  sparkles = pow(sparkles, 50.0) * smoothstep(0.4, 0.0, dist);
  finalColor += sparkles * colorA;

  float alpha = clamp(glow * decay + popGlow * 0.5, 0.0, 0.55);
  gl_FragColor = vec4(finalColor, alpha);
}`;

export type ShaderLayer = {
  popAt: (clientX: number, clientY: number) => void;
  destroy: () => void;
};

export function startShaderLayer(host: HTMLElement): ShaderLayer | null {
  const canvas = document.createElement('canvas');
  canvas.className = 'shader-canvas';
  host.append(canvas);

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) {
    host.remove();
    return null;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const compile = (type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uPopUv = gl.getUniformLocation(program, 'u_pop_uv');
  const uPopT = gl.getUniformLocation(program, 'u_pop_t');

  let popUv = { x: 0.5, y: 0.5 };
  let popAge = 99;
  let popClock = 0;
  let rafId = 0;
  let running = true;

  const syncSize = (): void => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
  resizeObserver?.observe(canvas);
  syncSize();

  const render = (t: number): void => {
    if (!running) return;
    if (!resizeObserver) syncSize();

    popClock = t * 0.001;
    popAge += 1 / 60;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (uTime) gl.uniform1f(uTime, popClock);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uPopUv) gl.uniform2f(uPopUv, popUv.x, popUv.y);
    if (uPopT) gl.uniform1f(uPopT, popAge);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    rafId = requestAnimationFrame(render);
  };

  rafId = requestAnimationFrame(render);

  return {
    popAt(clientX: number, clientY: number): void {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      popUv = {
        x: (clientX - rect.left) / rect.width,
        y: 1 - (clientY - rect.top) / rect.height,
      };
      popAge = 0;
    },
    destroy(): void {
      running = false;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      canvas.remove();
    },
  };
}

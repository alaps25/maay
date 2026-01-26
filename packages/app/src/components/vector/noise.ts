/**
 * Perlin Noise Implementation
 * 
 * Used for organic, natural-looking line variations.
 * Creates smooth, continuous random values.
 */

// Permutation table for Perlin noise
const permutation: number[] = [];
for (let i = 0; i < 256; i++) {
  permutation[i] = Math.floor(Math.random() * 256);
}
const p = [...permutation, ...permutation];

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * 2D Perlin Noise
 * Returns value between -1 and 1
 */
export function perlin2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  
  const u = fade(xf);
  const v = fade(yf);
  
  const aa = p[p[X] + Y];
  const ab = p[p[X] + Y + 1];
  const ba = p[p[X + 1] + Y];
  const bb = p[p[X + 1] + Y + 1];
  
  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v
  );
}

/**
 * Fractal Brownian Motion (FBM)
 * Layered noise for more natural variation
 */
export function fbm(
  x: number, 
  y: number, 
  octaves: number = 4,
  lacunarity: number = 2,
  gain: number = 0.5
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * perlin2D(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  
  return value / maxValue;
}

/**
 * Generate noise-based offset for a point along a line
 */
export function getLineNoise(
  t: number, 
  time: number, 
  intensity: number = 1,
  frequency: number = 1
): { x: number; y: number } {
  const noiseX = fbm(t * frequency, time * 0.5, 3) * intensity;
  const noiseY = fbm(t * frequency + 100, time * 0.5, 3) * intensity;
  return { x: noiseX, y: noiseY };
}

export default { perlin2D, fbm, getLineNoise };

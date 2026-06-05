// Generates topographic-contour placeholder SVG data URIs for events without cover images.

type Tone = { bg: string; a: string; b: string };

const TONES: Record<string, Tone> = {
  brick:  { bg: "#e8dad0", a: "#cbab97", b: "#b48d75" },
  forest: { bg: "#dbe2d4", a: "#a6b88f", b: "#7f9a6a" },
  wine:   { bg: "#e4d4d8", a: "#bd97a2", b: "#a07682" },
  gold:   { bg: "#ede1c9", a: "#d4bd84", b: "#bfa06a" },
  alpine: { bg: "#d9e0e5", a: "#abbcc7", b: "#8aa0ad" },
  sea:    { bg: "#d2e0e3", a: "#9bbdc6", b: "#76a3ae" },
};

const TONE_KEYS = Object.keys(TONES) as (keyof typeof TONES)[];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function contour(
  w: number,
  h: number,
  baseY: number,
  amp: number,
  phase: number,
  freq: number,
): string {
  const pts: string[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y =
      baseY +
      Math.sin((i / steps) * Math.PI * freq + phase) * amp +
      Math.sin((i / steps) * Math.PI * freq * 2.3 + phase * 1.7) * amp * 0.35;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return "M" + pts.join(" L");
}

export function makePlaceholder(seed: string, w = 640, h = 420): string {
  const r = hash(seed);
  const tone = TONE_KEYS[r % TONE_KEYS.length]!;
  const t = TONES[tone]!;
  const phase = ((r % 1000) / 1000) * Math.PI * 2;
  const freq = 1.4 + ((r >> 6) % 5) * 0.25;

  let lines = "";
  const n = 9;
  for (let i = 0; i < n; i++) {
    const baseY = h * (0.12 + (i / (n - 1)) * 0.82);
    const amp = 10 + i * 1.6;
    const ph = phase + i * 0.55;
    const col = i % 2 === 0 ? t.a : t.b;
    const op = (0.3 + (i / n) * 0.45).toFixed(2);
    const sw = (1.4 + i * 0.18).toFixed(2);
    lines += `<path d="${contour(w, h, baseY, amp, ph, freq)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-opacity="${op}" stroke-linecap="round"/>`;
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${t.bg}"/>` +
    `<stop offset="1" stop-color="${t.a}" stop-opacity="0.55"/>` +
    `</linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    lines +
    `</svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

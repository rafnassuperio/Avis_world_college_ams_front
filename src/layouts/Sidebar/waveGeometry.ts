// Geometry shared by every ribbon strand at the same horizontal sample.
export function createWaveSamples(width: number, height: number) {
  const samples = [];
  const spread = Math.max(14, Math.min(24, width * 0.09));
  for (let x = 0; x <= width; x += 5) {
    const u = x / width;
    samples.push({x, u,
      primaryBase: height * (0.58 - 0.26 * Math.exp(-Math.pow((u - 0.72) / 0.20, 2)) + 0.06 * Math.exp(-Math.pow((u - 0.20) / 0.16, 2)) - 0.08 * (u - 0.5)),
      crossingBase: height * (0.42 + 0.22 * Math.exp(-Math.pow((u - 0.70) / 0.24, 2)) - 0.05 * Math.exp(-Math.pow((u - 0.22) / 0.18, 2)) + 0.12 * (u - 0.3)),
      spread: spread * (1 - 0.48 * Math.exp(-Math.pow((u - 0.72) / 0.22, 2))),
      primaryY: 0, crossingY: 0, crossingSpread: 0,
    });
  }
  return samples;
}
export function updateWaveSamples(samples: ReturnType<typeof createWaveSamples>, width: number, time: number, mouse: {active: boolean; x: number; boost: number}) {
  const crossingSpread = Math.max(12, Math.min(22, width * 0.08));
  for (const point of samples) {
    const u = point.u;
    const distance = Math.abs(u - mouse.x / Math.max(width, 1));
    point.primaryY = point.primaryBase + 3.2 * Math.sin(2 * Math.PI * 0.75 * u - 1.15 * time) + 1.8 * Math.cos(2 * Math.PI * 1.35 * u + 0.85 * time) + Math.sin(2 * Math.PI * 0.4 * u - 0.45 * time)
      + (mouse.active ? Math.exp(-Math.pow(distance / 0.22, 2)) * -6 * mouse.boost : 0);
    point.crossingY = point.crossingBase + 2.6 * Math.sin(2 * Math.PI * 0.85 * u + 1.05 * time) + 1.5 * Math.cos(2 * Math.PI * 1.45 * u - 0.75 * time)
      + (mouse.active ? Math.exp(-Math.pow(distance / 0.25, 2)) * 4 * mouse.boost : 0);
    point.crossingSpread = crossingSpread + 4 * Math.sin(u * 3 + time);
  }
}

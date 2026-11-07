// The two springs the page uses, as plain data. Pure functions, so a test can check the curves without a browser.
// motion/gsap.ts turns them into named eases.

/** A spring as Motion described it: mass 1, from 0 to 1, starting at rest. */
export interface Spring {
  stiffness: number;
  damping: number;
}

/** A chosen chip arrives as a sent bubble. */
export const SEND_SPRING: Spring = { stiffness: 480, damping: 24 };
/** A rail node pops in. */
export const POP_SPRING: Spring = { stiffness: 500, damping: 18 };

/** Where an underdamped spring is at time t (seconds), 0 at the start and 1 at rest. Overshoots on the way. */
export function springAt({ stiffness, damping }: Spring, t: number): number {
  const w0 = Math.sqrt(stiffness);
  const zeta = damping / (2 * w0);
  if (zeta >= 1) throw new Error('springAt covers underdamped springs only');
  const wd = w0 * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
}

/** How long the spring takes to settle to within `rest` of 1 and stay there, in seconds. */
export function springDuration(spring: Spring, rest = 0.005): number {
  let last = 0;
  for (let t = 0; t < 4; t += 1 / 240) {
    if (Math.abs(springAt(spring, t) - 1) > rest) last = t;
  }
  return Math.ceil((last + 1 / 240) * 100) / 100;
}

/** The spring sampled into an SVG path (time across, value up) that CustomEase can read, plus the seconds it spans. */
export function springPath(spring: Spring, samples = 60): { path: string; duration: number } {
  const duration = springDuration(spring);
  let path = 'M0,0';
  for (let i = 1; i < samples; i++) {
    const x = i / samples;
    path += ` L${x.toFixed(4)},${springAt(spring, x * duration).toFixed(4)}`;
  }
  return { path: `${path} L1,1`, duration };
}

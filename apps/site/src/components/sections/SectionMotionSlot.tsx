'use client';

import { Quiet } from '@/components/layout/Quiet';
import { lazyPiece, useMotionAllowed } from '@/lib/motion/lazy';

// The section reveals are played by SectionMotion, loaded after the page has hydrated so GSAP stays out of the first paint. It is mounted
// only while motion is allowed, and if its code fails to load every section simply stays as it is.
const SectionMotion = lazyPiece(() => import('./SectionMotion'));

/** Where the section reveals are mounted: once, with the page. */
export function SectionMotionSlot() {
  const motion = useMotionAllowed();
  return motion ? (
    <Quiet>
      <SectionMotion />
    </Quiet>
  ) : null;
}

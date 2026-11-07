'use client';

import { useRef, type RefObject } from 'react';
import { shouldPlay, type Seen } from '@/lib/motion/arrival';
import { EASE, SEND, gsap, useGSAP } from '@/lib/motion/gsap';
import { Q_MOTION } from '@/lib/motion/queries';

/**
 * The arrival of a fresh answer in the Ask thread. It renders nothing: AskThread draws the exchange finished and tags the
 * new one data-fresh, and this plays it in. The question springs in as a sent bubble, and the answer rises 0.34s later.
 * With reduced motion nothing here runs and the exchange simply appears.
 */
export default function AskMotion({ scope, run }: { scope: RefObject<HTMLDivElement | null>; run: number }) {
  const seen = useRef<Seen>({ run: 0, at: 0 });
  useGSAP(
    () => {
      if (run === 0 || !shouldPlay(seen, run)) return; // the first answer is there from the start; an answer already seen is not replayed
      const q = gsap.utils.selector(scope);
      const done = { clearProps: 'opacity,transform' };

      const mm = gsap.matchMedia();
      mm.add(Q_MOTION, () => {
        const tl = gsap.timeline({ defaults: { ease: EASE } });
        tl.from(q('[data-fresh] .msg--sent'), { opacity: 0, scale: 0.8, y: 10, duration: SEND.duration, ease: SEND.ease, ...done }, 0);
        tl.from(q('[data-fresh] .ans-row'), { opacity: 0, y: 12, duration: 0.28, ...done }, 0.34);
      });
      return () => mm.revert();
    },
    { scope, dependencies: [run], revertOnUpdate: true },
  );
  return null;
}

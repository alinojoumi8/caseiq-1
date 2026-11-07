'use client';

import { useEffect } from 'react';
import { useFilm } from '@/components/FilmContext';
import { Quiet } from '@/components/layout/Quiet';
import { lazyPiece } from '@/lib/motion/lazy';

/** The player's code did not load: tell the context, so a tap on the film message goes to the text page and not nowhere. */
function PlayerFailed() {
  const { fail } = useFilm();
  useEffect(fail, [fail]);
  return null;
}

// The player is mounted once on the home page but its code is loaded after hydration, so it stays out of the first paint.
const Player = lazyPiece(() => import('./FilmPlayer'), PlayerFailed);

/** Where the film player is mounted. If its code fails to load, or it throws, nothing else on the page is affected. */
export function FilmPlayerSlot() {
  const { fail } = useFilm();
  return (
    <Quiet onError={fail}>
      <Player />
    </Quiet>
  );
}

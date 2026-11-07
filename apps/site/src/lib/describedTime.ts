// The described version of the film is the film with its picture held still, here and there, while a voice describes it. These
// two functions map a position between the two, so switching versions keeps the visitor where they were. Pure, so tests cover them.

/** A place where the described version holds: at film second `at` the picture freezes for `seconds`, the film's own sound pauses, and the description plays alone. */
export interface Hold {
  at: number;
  seconds: number;
}

/** A position in the film (seconds) as a position in the described version: the film's time plus every hold that has come before it. */
export function toDescribed(t: number, holds: readonly Hold[]): number {
  return t + holds.reduce((sum, h) => (h.at <= t ? sum + h.seconds : sum), 0);
}

/** A position in the described version as a position in the film. Inside a hold the picture is the frozen one, so that is the film's second the hold sits at. */
export function toFilm(t: number, holds: readonly Hold[]): number {
  let before = 0; // seconds of hold passed so far
  for (const h of holds) {
    const start = h.at + before;
    if (t < start) break;
    if (t < start + h.seconds) return h.at;
    before += h.seconds;
  }
  return t - before;
}

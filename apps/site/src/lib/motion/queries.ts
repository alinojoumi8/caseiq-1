// The media queries that decide how the page moves. One place, so the smooth scroll, the S4 scene and the one-shot
// animations all agree on what "motion allowed" and "wide and tall" mean.

/** The visitor has not asked for less motion. Every animation lives inside this. */
export const Q_MOTION = '(prefers-reduced-motion: no-preference)';
/** A mouse or trackpad on a screen that hovers: the only place smooth scrolling runs. Phones and tablets keep native scrolling. */
export const Q_SMOOTH = `${Q_MOTION} and (pointer: fine) and (hover: hover)`;
/** S4 pins and its camera-roll tiles fly to the rail. */
export const Q_PINNED = `${Q_MOTION} and (min-width: 900px) and (min-height: 800px)`;
/** S4 on a phone or narrow window: each row's tile lifts onto its node as the row scrolls into view. */
export const Q_INLINE = `${Q_MOTION} and (max-width: 899px)`;

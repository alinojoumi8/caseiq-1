// Camera-roll tiles: paths, sizes and provenance for the hero's old roll and the S4 filing scene.
// Written by scripts/roll-assets.mjs (npm run roll:assets), which derives public/roll/ from docs/marketing/site-media/roll/. Re-running the
// script overwrites this file, so change the script, not the numbers. Keep this file free of imports so the scripts can load it directly.
// (It sits beside media.ts and not in it: media.ts is rewritten whole by scripts/film-assets.mjs.)
// Everything here is AI-generated: illustrations of example documents; the text in them is not real.

export interface RollTile {
  /** Public path, served from /public. */
  src: string;
  width: number;
  height: number;
  bytes: number;
  /** The source image the tile was cut from, relative to the repo. */
  from: string;
  /** A duplicate derived from another tile's source (7 from 3, 8 from 4), with no new generation. */
  derived: boolean;
  /** Graded a little toward the film's warm, low-light look. */
  graded: boolean;
  /** Softened at tile size (sigma 1.9 on the typed pages, 2.5 on the email, 4.6 on the note's ink layer alone) so no letter can be made out, at 216px or at 3x. */
  softened: boolean;
  /** The words painted into the picture after it was generated (the generated text is not words): lines of the example case, from examples.ts. */
  painted: string[];
  /** The prompt for each source is in PROVENANCE.md beside the images (prompts are not copy, and are kept out of this file). */
  seed: number;
  kreaJob: string;
}

export const rollMedia = {
  model: 'Krea: bfl/flux-2-klein, 1K, 4 steps, cfg 1',
  madeOn: '2026-11-06',
  aiGenerated: true as const,
  note: 'Illustrations of example documents; the text in them is not real.',
  /** What was done to the generated text after generation (the sources in docs/ are as generated). */
  textNote:
    'In the chat and the job posting the generated text was painted over, after generation, with lines of the example case (src/content/examples.ts), set in Geist; the other text in them was removed or blurred past reading. The paper photos were softened at tile size (in the handwritten note, its ink only).',
  source: 'docs/marketing/site-media/roll/',
  rebuild: 'Rebuild the tiles with `npm run roll:assets` in apps/site.',
  tiles: {
    1: {
      src: '/roll/tile-1.webp',
      width: 324,
      height: 324,
      bytes: 1934,
      from: 'docs/marketing/site-media/roll/t1-chat.png',
      derived: false,
      graded: false,
      softened: false,
      painted: ['They posted your old job online today','3 Feb 2025'],
      seed: 4101,
      kreaJob: 'fb88fcaa-eade-4062-9de6-29f28ad5b65e',
    },
    2: {
      src: '/roll/tile-2.webp',
      width: 216,
      height: 216,
      bytes: 2162,
      from: 'docs/marketing/site-media/roll/t2-note.png',
      derived: false,
      graded: true,
      softened: true,
      painted: [],
      seed: 4102,
      kreaJob: '007a61c3-b088-481d-961f-e001896f9341',
    },
    3: {
      src: '/roll/tile-3.webp',
      width: 216,
      height: 216,
      bytes: 1404,
      from: 'docs/marketing/site-media/roll/t3-letter.png',
      derived: false,
      graded: true,
      softened: true,
      painted: [],
      seed: 4103,
      kreaJob: '25cea539-c2ab-41b0-92ba-4c34922d3251',
    },
    4: {
      src: '/roll/tile-4.webp',
      width: 216,
      height: 216,
      bytes: 1172,
      from: 'docs/marketing/site-media/roll/t4-email.png',
      derived: false,
      graded: true,
      softened: true,
      painted: [],
      seed: 4104,
      kreaJob: '89084569-2f27-419e-b01d-fca2a2f9f5c1',
    },
    5: {
      src: '/roll/tile-5.webp',
      width: 216,
      height: 216,
      bytes: 1608,
      from: 'docs/marketing/site-media/roll/t5-letter2.png',
      derived: false,
      graded: true,
      softened: true,
      painted: [],
      seed: 4105,
      kreaJob: '6228b6c4-8172-4691-ba39-1871a3147056',
    },
    6: {
      src: '/roll/tile-6.webp',
      width: 324,
      height: 162,
      bytes: 1980,
      from: 'docs/marketing/site-media/roll/t6-posting.png',
      derived: false,
      graded: false,
      softened: false,
      painted: ['Operations Coordinator','Full-time'],
      seed: 4106,
      kreaJob: '2e1ffb16-796e-4aad-80f4-d302f1ca75ad',
    },
    7: {
      src: '/roll/tile-7.webp',
      width: 216,
      height: 216,
      bytes: 1742,
      from: 'docs/marketing/site-media/roll/t3-letter.png',
      derived: true,
      graded: true,
      softened: true,
      painted: [],
      seed: 4103,
      kreaJob: '25cea539-c2ab-41b0-92ba-4c34922d3251',
    },
    8: {
      src: '/roll/tile-8.webp',
      width: 216,
      height: 216,
      bytes: 1850,
      from: 'docs/marketing/site-media/roll/t4-email.png',
      derived: true,
      graded: true,
      softened: true,
      painted: [],
      seed: 4104,
      kreaJob: '89084569-2f27-419e-b01d-fca2a2f9f5c1',
    },
  } as Record<number, RollTile>,
};

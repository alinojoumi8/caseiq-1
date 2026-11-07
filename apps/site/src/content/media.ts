// Film media: paths, sizes, caption lines and provenance for the 30 s film and the hero film message.
// Written by scripts/film-assets.mjs (npm run film:assets), which measures every value from the files in public/film/.
// Re-running the script overwrites this file, so change the script, not the numbers. Keep this file free of imports so the scripts can load it directly.
// Everything here is AI-generated: label it on the page as made with AI.

export interface ImageAsset {
  /** Public path, served from /public. */
  src: string;
  width: number;
  height: number;
  bytes: number;
  /** MIME type. */
  type: string;
  aiGenerated: true;
}

export interface VideoAsset extends Omit<ImageAsset, 'type'> {
  type: 'video/mp4';
  durationSeconds: number;
  fps: number;
  hasAudio: boolean;
}

export interface CaptionLine {
  id: string;
  /** The words, exactly as spoken. */
  text: string;
  /** Seconds into the film where the voice starts and stops, measured on the voice stems. */
  start: number;
  end: number;
}

export interface SpeedStep {
  /** Source seconds in clip2_take1.mp4. */
  from: number;
  to: number;
  /** Playback speed, 1 = real time. */
  speed: number;
  note: string;
}

export interface DescribedHold {
  id: string;
  /** The film second where the picture freezes. The film's own sound pauses too, and the description plays alone. */
  at: number;
  /** For how long. */
  seconds: number;
  why: string;
}

export interface DescribedLine {
  id: string;
  /** What the describer says. */
  text: string;
  /** The film second where the line starts. */
  filmAt: number;
  /** Where the line falls in the described version (which is longer than the film by its holds), in seconds. */
  start: number;
  end: number;
}

/** The extended audio-described version of the film (WCAG 1.2.5): the film with its picture held, here and there, while a voice describes it. */
export interface DescribedFilm extends VideoAsset {
  md5: string;
  /** Its own captions: the film's, with each cue moved by the holds before it. */
  captions: { src: string; bytes: number; type: 'text/vtt'; language: string; label: string };
  holds: DescribedHold[];
  lines: DescribedLine[];
  /** The film's voice cues as they fall in the described version, each with its quarter-second hold: no line may overlap one. */
  cues: { id: string; start: number; end: number }[];
  loudness: { integrated: number; truePeak: number };
  voice: { tool: string; voice: string; kreaJob: string; madeOn: string; take: string; takeMd5: string };
}

export interface FilmMedia {
  film: VideoAsset & { md5: string };
  described: DescribedFilm;
  captions: { src: string; bytes: number; type: 'text/vtt'; language: string; label: string; lines: CaptionLine[] };
  /** Player posters, widest first. Frame 0 of the film. */
  posters: ImageAsset[];
  hero: {
    /** The silent square clip: the pile lifts and snaps into one column, then stops. */
    clip: VideoAsset & { frames: number; crf: number };
    /** The clip's first frame, smallest first. Shown with no JavaScript. */
    pile: ImageAsset[];
    /** The clip's last frame, smallest first. Shown under reduced motion. */
    column: ImageAsset[];
    cut: {
      from: string;
      crop: { w: number; h: number; x: number; y: number };
      scaledTo: number;
      grade: string;
      speedMap: SpeedStep[];
    };
  };
  provenance: {
    madeOn: string;
    madeFor: string;
    footage: string;
    voice: string;
    music: string;
    thirdPartyFootage: boolean;
    realPeople: boolean;
    aiGenerated: true;
    source: string;
    siteCut: string;
    rebuild: string;
  };
}

export const filmMedia: FilmMedia = {
  film: {
    src: '/film/case-iq-film-30s.mp4',
    width: 720,
    height: 1280,
    durationSeconds: 30,
    fps: 24,
    bytes: 6670537,
    type: 'video/mp4',
    aiGenerated: true,
    hasAudio: true,
    md5: 'eed0bbe98d5486a7a66966d2412a9bcc',
  },
  described: {
    src: '/film/case-iq-film-30s-described.mp4',
    width: 720,
    height: 1280,
    durationSeconds: 45.75,
    fps: 24,
    bytes: 7803948,
    type: 'video/mp4',
    aiGenerated: true,
    hasAudio: true,
    md5: '3e5e78c6c06e287f9ce89bc3dd382022',
    captions: {
      src: '/film/case-iq-film-30s-described.en.vtt',
      bytes: 645,
      type: 'text/vtt',
      language: 'en',
      label: 'English',
    },
    holds: [
      {
        id: 'papers',
        at: 4.7917,
        seconds: 1.2917,
        why: 'The papers are still on the table, right before they lift, while line 1 describes them.',
      },
      {
        id: 'timeline',
        at: 19.7083,
        seconds: 7.0833,
        why: 'The finished timeline, its three rows showing, on its last frame before the cut to morning, while line 3 describes them.',
      },
      { id: 'end', at: 30, seconds: 7.375, why: 'The last frame, the end card, while line 4 describes it.' },
    ],
    lines: [
      { id: 'D1', text: 'A table piled with papers, at night.', filmAt: 3.65, start: 3.65, end: 6.315 },
      {
        id: 'D2',
        text: 'The papers rise, and land in one straight column.',
        filmAt: 7.425,
        start: 8.717,
        end: 11.787,
      },
      {
        id: 'D3',
        text: 'A timeline rises, marked: example, not a real case. Each dated row shows its page: an email saying your role is not affected, a letter saying your position has been eliminated, and texts.',
        filmAt: 14.11,
        start: 15.402,
        end: 27.757,
      },
      {
        id: 'D4',
        text: 'On screen: Case IQ isn’t a law firm and doesn’t give legal advice. Pictures, voice and music made with AI.',
        filmAt: 29.35,
        start: 37.725,
        end: 45.235,
      },
    ],
    cues: [
      { id: 'A1', start: 0.45, end: 1.95 },
      { id: 'A2', start: 2, end: 3.635 },
      { id: 'B', start: 6.442, end: 8.702 },
      { id: 'C1', start: 11.992, end: 13.192 },
      { id: 'C2', start: 13.242, end: 15.387 },
      { id: 'D', start: 28.675, end: 31.175 },
      { id: 'E1', start: 32.425, end: 33.79 },
      { id: 'E2', start: 33.925, end: 37.71 },
    ],
    loudness: { integrated: -14, truePeak: -1.6 },
    voice: {
      tool: 'Krea: elevenlabs/tts, model eleven_v4',
      voice: 'ElevenLabs TTS, eleven_v4, voice "Eric" (cjVigY5qzO86Huf0OWal)',
      kreaJob: '2b7820e7-ea0e-413b-ba77-5487ca11ac46',
      madeOn: '2026-11-06',
      take: 'docs/marketing/commercial-30s/source/audio/described/ad_take1.mp3',
      takeMd5: '5e47a744074fafe90d10c84742bbf385',
    },
  },
  captions: {
    src: '/film/case-iq-film-30s.en.vtt',
    bytes: 639,
    type: 'text/vtt',
    language: 'en',
    label: 'English',
    lines: [
      { id: 'A1', text: 'You know what happened.', start: 0.45, end: 1.815 },
      { id: 'A2', text: 'It’s in here somewhere.', start: 2, end: 3.385 },
      { id: 'B', text: 'Let’s find the page that shows it.', start: 5.15, end: 7.16 },
      { id: 'C1', text: 'One timeline.', start: 10.7, end: 11.66 },
      { id: 'C2', text: 'The page behind every fact.', start: 11.95, end: 13.845 },
      { id: 'D', text: 'Bring the pile. Leave with a timeline.', start: 20.3, end: 22.55 },
      { id: 'E1', text: 'Case IQ.', start: 24.05, end: 25.165 },
      { id: 'E2', text: 'A flat price agreed before we start, never hourly.', start: 25.55, end: 29.085 },
    ],
  },
  posters: [
    {
      src: '/film/case-iq-film-30s-poster-720.webp',
      width: 720,
      height: 1280,
      bytes: 55324,
      type: 'image/webp',
      aiGenerated: true,
    },
    {
      src: '/film/case-iq-film-30s-poster-360.webp',
      width: 360,
      height: 640,
      bytes: 22346,
      type: 'image/webp',
      aiGenerated: true,
    },
  ],
  hero: {
    clip: {
      src: '/film/hero-snap-640.mp4',
      width: 640,
      height: 640,
      durationSeconds: 4.167,
      fps: 24,
      bytes: 460544,
      type: 'video/mp4',
      aiGenerated: true,
      hasAudio: false,
      frames: 100,
      crf: 24,
    },
    pile: [
      {
        src: '/film/hero-pile-320.webp',
        width: 320,
        height: 320,
        bytes: 15746,
        type: 'image/webp',
        aiGenerated: true,
      },
      {
        src: '/film/hero-pile-480.webp',
        width: 480,
        height: 480,
        bytes: 26526,
        type: 'image/webp',
        aiGenerated: true,
      },
      {
        src: '/film/hero-pile-640.webp',
        width: 640,
        height: 640,
        bytes: 35854,
        type: 'image/webp',
        aiGenerated: true,
      },
    ],
    column: [
      {
        src: '/film/hero-column-320.webp',
        width: 320,
        height: 320,
        bytes: 8624,
        type: 'image/webp',
        aiGenerated: true,
      },
      {
        src: '/film/hero-column-480.webp',
        width: 480,
        height: 480,
        bytes: 15516,
        type: 'image/webp',
        aiGenerated: true,
      },
      {
        src: '/film/hero-column-640.webp',
        width: 640,
        height: 640,
        bytes: 22134,
        type: 'image/webp',
        aiGenerated: true,
      },
    ],
    cut: {
      from: 'docs/marketing/commercial-30s/source/footage/clip2_take1.mp4',
      crop: { w: 768, h: 768, x: 0, y: 290 },
      scaledTo: 640,
      grade: 'huesaturation=colors=c+b:saturation=-1:strength=60',
      speedMap: [
        { from: 0.45, to: 1.85, speed: 1, note: 'the pile stirs and lifts' },
        { from: 1.85, to: 2.55, speed: 1.5, note: 'the snap' },
        { from: 2.55, to: 6.1875, speed: 1.6, note: 'the column lands and settles; ends on the settle point' },
      ],
    },
  },
  provenance: {
    madeOn: '2026-11-01',
    madeFor: 'Case IQ',
    footage: 'Krea: MiniMax H3 Max Turbo at 768p, from Flux 2 Klein 1K keyframes',
    voice: 'ElevenLabs TTS, eleven_v4, voice "Sarah"',
    music: 'ElevenLabs Music v2.5',
    thirdPartyFootage: false,
    realPeople: false,
    aiGenerated: true,
    source: 'docs/marketing/commercial-30s/',
    siteCut: 'This is the site cut of the film (docs/marketing/commercial-30s/site-cut/): the approved ad without its drawn "Get my case in order" button, which nobody could press, and with the line "Pictures, voice and music made with AI." added to the fine print on the end card. The ad itself is unchanged.',
    rebuild: 'Re-render the site cut from docs/marketing/commercial-30s/source/ with `node build/run.mjs --cut site` (see site-cut/README.md); rebuild these files with `npm run film:assets` in apps/site.',
  },
};

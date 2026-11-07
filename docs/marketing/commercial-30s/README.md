# Case IQ: 30-second test commercial

- **`caseiq-30s-vertical.mp4`:** the ad.
  - Format: 720x1280 (9:16), 30.0 s, 24 fps, H.264 with AAC 48 kHz.
  - Loudness: -14.1 LUFS, true peak -1.3 dBTP.
  - Made for Reels, TikTok and Shorts.
- **`caseiq-30s-poster.png`:** the last frame, for use as a cover or thumbnail.
- **`source/`:** everything needed to re-render it without spending Krea credits (see the end of this file).

## A low-cost test
The brief asked for:
- the lowest Krea spend;
- video no higher than 780p;
- low-res images;
- MiniMax H3 or Kling 4.0 instead of Seedance.

| Item | Model | Krea credits |
|---|---|---|
| Video: 3 clips (5 + 6 + 5 s) | MiniMax H3 Max Turbo, 768p | 474 |
| Music: one 30 s track | ElevenLabs Music v2.5 | 444 |
| Voice: two takes | ElevenLabs TTS, eleven_v4, "Sarah" | about 19 |
| Keyframes: 10 tries | Flux 2 Klein and Z Image, 1K | about 15 |
| **Total** | | **953** |

For comparison:
- The 10-second spot cost about 9,500 credits.
- Kling 4.0 at 720p costs about 4 times as much as MiniMax H3 Max Turbo for the same seconds of video.
- Music turned out to be the expensive part. A future test could reuse a track that's already paid for.

## The spot
| Seconds | Picture | Words (voice and on screen) |
|---|---|---|
| 0–4.5 | A night kitchen table, seen from above, buried in papers. A bundle lands with a thud and two hands dig through it, searching. | "You know what happened." "It’s in here somewhere." |
| 4.5–10.5 | The pile goes still and the music cuts out. The papers lift, gather and land in one straight column. | "Let’s find the page that shows it." |
| 10.5–19.7 | A timeline panel lifts out of the column, labelled "Example, not a real case". Three dated rows land in turn: an email (12 Jan, “Your role is not affected by the restructuring.”), a letter (28 Jan, “Your position has been eliminated, effective today.”) and texts (3 Feb, “They posted your old job online today”). | "One timeline. The page behind every fact." |
| 19.7–23.7 | Morning. A hand rests on the squared stack. | "Bring the pile. Leave with a timeline." |
| 23.7–30 | End card: the example timeline at rest, the Case IQ wordmark, "A flat price agreed before we start, never hourly.", the "Get my case in order" button, and "Case IQ isn’t a law firm and doesn’t give legal advice." | "Case IQ. A flat price agreed before we start, never hourly." |

**Where every word comes from:**
- **Site copy:** the hero headline and subhead, the S4 heading and the main call to action.
- **The claim register:** K3 in its full wording, and C1, which sits next to the button.
- **The site's example:** the timeline rows are `timelineExamples` items 1, 3 and 4 in `apps/site/src/content/examples.ts`, word for word.

The spot never states a conclusion about the example. The papers tell the story.

## Before it runs
1. **Founder confirms C2** ("every fact links to the page it came from"). The timeline dramatizes it, so it needs the same sign-off as the hero subhead.
2. **Turn on the platform's AI-generated label.** The footage is photorealistic AI.
3. **Run it with the platform's link button, targeted to Ontario.** The ad shows no web address, because the domain isn't decided yet, and searching "Case IQ" finds an unrelated Ottawa company.
4. **Post caption.** Keep any delivery time out of it: turnaround (K6) isn't set, and the cut from night to morning already hints at speed. A suggested caption:

   > You know what happened. Let’s find the page that shows it.
   > One timeline, with the page behind every fact. A flat price agreed before we start, never hourly.
   > Case IQ isn’t a law firm and doesn’t give legal advice. The timeline shown is an example, not a real case.

## How it was made
- **Keyframes** (Flux 2 Klein, 1K, about 1.5 credits each):
  - the night pile;
  - the same table with the papers in one column, made with the first image as a reference so the mug and phone stay put;
  - the morning tray.
- **Motion** (MiniMax H3 Max Turbo, 768p):
  - clip 1 (5 s): the bundle and the search;
  - clip 2 (6 s): from clip 1's last frame to the column frame;
  - clip 3 (5 s): the morning shot.
  - Clip 1's own audio (the thud and the paper rustle) is used as sound effects.
- **Edit:**
  - the papers gathering into the column is played 1.5x, so it reads as a snap;
  - clip 2's last frame holds under the timeline with a slow push-in;
  - a colour grade removes a cyan cast from the night footage.
- **Overlays and end card:** HTML in the brand's type (Bricolage Grotesque, JetBrains Mono, Source Serif 4), captured frame by frame at 720x1280. They are the same components as the 10-second spot.
- **Audio:**
  - the voice lines are gain-matched to within 1 LU;
  - the music is cut on the beat to the picture: a pulse, a held breath at the lift, a swell on the panel, a warm section under the timeline and the morning, and the resolve on the end card;
  - the master is two-pass loudnorm to -14 LUFS.

## Reviews
Three independent critics scored the ad against a written bar: every dimension at 8 or above, and no blocking issues.

| Critic | v1 | v2 (final picture) |
|---|---|---|
| Creative director (hook, pacing, craft, brand) | 7 · 7 · 7 · 7 | 8 · 8 · 8 · 8 |
| Stressed target viewer, "Maria" (stop, understand, trust, act) | 9 · 8 · 7 · 7 | 9 · 9 · 8 · 8 |
| Honesty, brand and accessibility (claims, brand, accessibility, voice) | 9 · 8 · 6 · 9, plus one blocking issue | 9 · 9 · 9 · 9 |

**What changed from v1 to v2:**
- the spot opens on motion, with a small scale bump on the thud;
- the timeline panel grows row by row, and the last row holds 3.5 s instead of 1.9 s;
- the end card ends on the example timeline;
- the price line uses K3's full wording;
- the turn line is re-voiced at a calmer pace;
- the cyan cast is graded out;
- the sender label moved inside the safe zone and passes contrast (the blocking issue);
- only the newest bubble has a tail, as on the site.

**v3** is audio only: the voice lines were gain-matched, because two of them sat 5–6 dB low. The picture is frame for frame identical to v2. v3 was verified by measurement, not re-scored.

**Sound check (2026-11-01):** listened to with sound on, and it sounds fine. "Bring the pile." measured about 6 semitones above the voice's other lines, but it keeps its current take; nothing was re-voiced.

**Accepted as they are:**
- the papers gathering into the column is a brief morph, not sheets gliding one by one;
- the morning stack reads as a fresh ream of paper.

A retake of either would cost about 150 credits.

## Re-rendering (`source/`)
- **Command:** from `source/`, run `node build/run.mjs --tmp-dir <a folder outside the repo> --out-dir <a folder outside the repo>`.
  - A run writes about **2.5 GB** of temporary frames. Without the options, it writes them to `source/build/tmp/` and the video to `source/out/`. Keep both out of git.
  - The environment variables `CASEIQ_TMP` and `CASEIQ_OUT` work too.
- **Needs:**
  - ffmpeg, ffprobe and node on PATH;
  - Python 3 with the packages in `requirements.txt` (numpy, scipy, matplotlib, pillow);
  - the site's Playwright install in `apps/site/node_modules`.
  - The lift whoosh is read from the 10-second spot's footage, `../commercial/source/footage/finalA.mp4`.
- **Where edits go:**
  - copy, timings, the edit and the audio map: `build/config.json`;
  - overlay layout: `build/overlay.html`.
- **Verified:** a re-run from this folder produced a byte-identical copy of `caseiq-30s-vertical.mp4` (MD5 `2386dddaab70864785d80cd849efc842`).
- **The site cut:** `node build/run.mjs --cut site ...` renders the cut the website plays (no drawn button on the end card, the AI line added). See `../site-cut/README.md`. It is free, like the ad's own render, and leaves the ad's render unchanged.
- **Other files:** `source/brief.md`, `critique-rubric.md` and `review-pack.md` are the brief, the critics' rubric and the review notes. `source/keyframes/` holds the three keyframes that were used.

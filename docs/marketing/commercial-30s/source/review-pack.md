# Review pack: Case IQ 30-second test commercial, v1

- **File:** `out/caseiq-30s-v1.mp4` (in this folder).
  - 720x1280, 24 fps, 720 frames (30.000 s).
  - H.264 with AAC.
- **Spec and scoring:** `brief.md` and `critique-rubric.md`.

## What to look at (`out/qa_v1/`)
- **Contact sheet:** `contact_sheet.png`, one frame every 0.5 s with time stamps.
- **Full-size frames:**
  - `frame_*.png` at 0.00, 0.40, 1.20, 2.50, 4.00, 5.40, 6.40, 7.50, 9.00, 10.80, 11.60, 12.40, 15.00, 17.80, 19.20, 20.50, 23.00, 24.10, 24.60, 26.00 and 29.95 s;
  - `poster.png`, the last frame.
- **Every-frame strips:**
  - `strip_4_70-7_10s.png`: the cut from clip 1 to clip 2, the lift, and the papers gathering into a column (played 1.5x);
  - `strip_10_90-12_20s.png`: the timeline panel lift;
  - `strip_18_90-19_30s.png`: the cut to the morning shot;
  - `strip_23_90-24_70s.png`: the end card arriving.
- **Timings and audio:**
  - `timeline.md`: every picture, overlay and audio event;
  - `audio_placements.md`: the voice and music cut points;
  - `final_mix_waveform_spectrogram.png` and `stems_and_cuts.png`: the audio pictures;
  - `ebur128.txt`: loudness.
- **Checks:** `guards.txt` (automated checks) and `text_sizes.txt` (the rendered size of every text element).
- **Anything else:** pull it yourself, for example `ffmpeg -ss 13.0 -i out/caseiq-30s-v1.mp4 -frames:v 1 x.png`.

## The words
The voice is ElevenLabs "Sarah" (eleven_v4). Every spoken line is also on screen.

| Time (s) | Voice | On screen |
|---|---|---|
| 0.75 | "You know what happened." | Bubble 1, from frame 1 |
| 2.30 | "It’s in here somewhere." | Bubble 2 at 2.25 |
| 5.45 | "Let’s find the page that shows it." | Bubble 3 at 5.40 |
| 11.00 | "One timeline." | Bubble 4 at 10.95, the whole line at once |
| 12.25 | "The page behind every fact." | (bubble 4) |
| 19.60 | "Bring the pile. Leave with a timeline." | Bubble 5 at 19.55 |
| 24.45 | "Case IQ." | Wordmark at 24.15 |
| 25.75 | "A flat price, never hourly." | Price line at 24.30 |

**Timeline panel (11.25–19.0):**
- **Header:** "Your papers show" and "Example, not a real case".
- **Rows,** landing at 11.9, 14.5 and 17.1:
  1. 12 Jan 2025 · Email · page 1: “Your role is not affected by the restructuring.”
  2. 28 Jan 2025 · Letter · page 1: “Your position has been eliminated, effective today.”
  3. 3 Feb 2025 · Texts · page 4: “They posted your old job online today”

## Audio facts (measured; nobody has listened)
- **Music:** ElevenLabs Music v2.5, instrumental, a felt-piano pulse at about 76 BPM, cut to the picture:
  - the pulse runs from 0 to 5.15 s;
  - silence from 5.15 to 6.88, a held breath under the lift, with only the whoosh and "Let’s find the page that shows it.";
  - the pulse resumes at 6.88 on the landing pages and runs into a swell that peaks at 11.25, as the panel lifts;
  - a warmer, fuller section from 14.48 to 24.0;
  - the resolving chord lands at 24.00 with the end card and rings out to silence at 29.9 (about -45 dBFS at 29 s).
- **Levels:** the music sits about 9 LU under the voice and is ducked about 7 dB under each line.
- **Sound effects:**
  - **From the video model:** a paper thud as the bundle lands (0.55 s) and rustles while the hands search (1.0–4.0 s), kept 10 dB under the voice peak.
  - **Added:** a lift whoosh at 5.15, landing taps from 6.9 to 9.4, a soft paper swish at the panel lift (11.25), quiet ticks as rows land, and room tone under the morning shot.
- **Master:** -14.0 LUFS integrated, LRA 5.5 LU, true peak -1.3 dBTP.

## Known v1 issues, already being fixed for v2 (don't spend words on them)
1. **Empty panel:** the timeline panel is full size from its lift, so it's mostly empty white until row 3 lands. In v2, the card grows with each row, and row 1 arrives with the lift.
2. **Price-line mismatch:** the voice says "A flat price, never hourly." but the end card reads "Flat price, never hourly." In v2, the end card line becomes "A flat price, never hourly." to match the voice. That is still the register's K3 wording.

# Review pack: Case IQ 10-second commercial

## v3 (current). File: `out/caseiq-10s-v3.mp4`, QA in `out/qa_v3/`
**QA files:**
- `contact_sheet.png`
- `poster.png`
- frames at 0.00, 0.60, 1.40, 2.60, 3.40, 4.15, 5.80, 6.40, 7.70, 8.40 and 9.95 s (`frame_*.png`)
- 24 fps strips: `strip_3_9-4_5s_artifact.png` and `strip_5_3-6_3s_card_lift.png`
- `guards.txt`

**What changed since v1:**
- **Hook:** frame 1 is a 1.2x crop on the searching hands, with no lamp. It eases out to the full frame by 1.2 s. Bubble 1 is already on screen at frame 1, and the voiceover's first line starts at 0.20.
- **Sender, from frame 1:**
  - a "Case IQ" sender label above bubble 1;
  - a white avatar circle with the black chat glyph, beside the newest bubble.
  - The bubbles moved right to x 222.
- **Glitch (src 5.00–5.58):** a clean frame skip (src frames 120, 122, 127, 131, 133) replaces the morphing stretch.
  - The mug now jumps once, mid-flurry, at about 4.15 s.
  - One frame at 4.167 s and one at 4.25 s carry mild smear.
- **Faster still moments:** the still column and the hand's approach are compressed. The fingertip lands at 5.43 s.
- **Payoff:** the "p. 47" tag is gone. At 5.63 s:
  - a 35% dark scrim falls over the footage, leaving a spotlight on the touched page;
  - the site's quote card lifts out of that page (rotated -1.4°, lift shadow) and settles under bubble 2;
  - card content, exactly as on the site's example case: the label "Your papers show", an "Example" pill, the mono source line "Email from your manager · 12 Jan 2025 · page 1", and the serif quote on slate with its quotation stripe, “Your role is not affected by the restructuring.”
  - The footage pushes in from 1.00 to 1.03 under it until 7.60.
- **End card (7.60):**
  - The ground rises. The label, avatar, both bubbles and the lifted card stay in place.
  - The wordmark arrives at 7.75 and the send pill at 7.95.
  - Two fine-print lines rise with the ground: "A flat price agreed before we start, never hourly." (K3, confirmed by the founder on 2026-10-31) and "Case IQ isn’t a law firm and doesn’t give legal advice." (C1).
  - The line "Bring the pile. Leave with a timeline." is removed.
  - The voiceover "…Case IQ." is at 7.85.
- **Loudness:** -13.9 LUFS, -1.3 dBTP, LRA 5.0.

**Known, to be fixed in the next polish:** for about two frames near 5.75–5.8 s, the card's spring overshoots and overlaps bubble 2's bottom edge.

---

## v1 (superseded; kept for reference)

**File:** `out/caseiq-10s-v1.mp4` (in this folder). It is 1080x1920, 24 fps, exactly 10.000 s, H.264 with AAC.
**Spec and scoring:** `brief.md` and `critique-rubric.md`.

## What to look at
- `out/qa/contact_sheet.png`: one frame every 0.5 s, with time stamps.
- Full-size frames in `out/qa/`: `frame_0_40s`, `frame_1_50s`, `frame_2_60s`, `frame_3_40s`, `frame_5_00s`, `frame_6_30s`, `frame_6_90s`, `frame_7_68s`, `frame_8_40s`, `frame_9_95s` (all `.png`), and `poster.png` (the last frame).
- `out/qa/check_7s.png`: every frame from 7.00 to 7.71 s (the end-card transition).
- For anything else, extract it yourself, e.g. `ffmpeg -ss 4.2 -i out/caseiq-10s-v1.mp4 -frames:v 1 x.png`.

## Output timeline (seconds)
| Time | Picture | Sound |
|---|---|---|
| 0.00–1.90 | A night kitchen table from above, buried in papers. Two hands flick hard through a thick sheaf, searching. Bubble 1 pops in at 0.30. | The music pulse: one low repeated felt-piano note and soft ticks. Paper rustle. The voiceover at 0.30: "You know what happened…" |
| 1.90–2.20 | The hands are gone and the pile sits still for a moment. | The voiceover ends at about 2.15. |
| 2.20–3.05 | Every sheet lifts off the table and hangs in the air. | The music stops at 2.30. Near silence, except a soft paper whoosh. |
| 3.05–4.90 | The sheets file one after another into a single straight column down the table, top to bottom. The phone and mug slide aside. Bubble 2 at 3.15. | At 3.05 a warm piano rise begins. The voiceover at 3.15: "Let’s find the page that shows it." Paper landings underneath. |
| 4.90–5.90 | The column is still. A hand enters from the right and a fingertip lands on one page, at about 5.90. | The piano rise continues. |
| 6.00 | A "p. 47" page tag pops onto the touched page. | |
| 6.79–7.30 | The last frame holds. | |
| 7.30–7.56 | The light brand ground rises from the bottom and covers the footage. The two bubbles stay in place. | The music resolves on a chord at about 7.43. |
| 7.45 / 7.65 / 7.85 | In turn: the wordmark (chat glyph and "Case IQ"), the line "Bring the pile. Leave with a timeline.", then the indigo "Get my case in order" pill and the fine print "Case IQ isn’t a law firm and doesn’t give legal advice." | The voiceover at 7.70: "…Case IQ." |
| 7.85–10.00 | The end card holds. | The chord rings out and fades to silence by 9.95. |

## Audio facts (measured; nobody has listened to it)
- **Voiceover:** ElevenLabs "Sarah" (eleven_v4), described by the vendor as a mature, reassuring, confident female voice. US-neutral accent.
- **Music:** ElevenLabs Music v2.5, instrumental.
  - Part A is the restless pulse.
  - There is a cut to silence for the hover.
  - Part B starts on a sharp onset with a warm felt-piano rise and resolves on a chord.
  - The music sits 9 LU under the voice and is ducked 7 dB under each line.
- **Native sound** from the video model: paper rustle, a whoosh at the lift, and landing taps. It has no music and no speech, is high-passed at 90 Hz, and sits 6 LU under the music.
- **Master:** -13.9 LUFS integrated, -1.3 dBTP, LRA 4.6.

## Known v1 issues (already being fixed in v2, so don't spend words on them)
1. At 7.50 and 7.54 s, two frames drop every overlay and flash back to bare footage.
2. The fine print grows from 34 px to 36 px and arrives with the ground at 7.30.
3. The page tag grows to 44 px and appears 0.2 s after the fingertip lands.
4. The bubbles' heavy footage shadow eases to the brand's card shadow on the end card.

## How it was made
- **Keyframes:** Krea Nano Banana Pro.
- **Motion:** Seedance 2.5, one continuous locked overhead take (8 s). The speed map squeezes the still moments and keeps the motion at 1x.
- **Overlays:** HTML with the brand fonts, captured frame by frame.

# Case IQ: 30-second test commercial, brief v1

The user's request (2026-11-01): "Can you create another commercial for case iq using krea mcp. we need to make the audience captivated. Make a 30 second commercial. Since we are doing a test commercial don't use high quality images or videos. Use lower res images and instead of seaddance use minimax h3 or king 4.0. Make this commercial with the lowest credit spend. Video should be 780p not higher."

## Constraints behind every choice
- **Lowest Krea spend.**
  - Generate as few seconds of video as possible.
  - Do everything else in post, where it's free: HTML overlays, holds, push-ins, crops, speed maps and audio editing.
  - Regenerate footage only for an AI artifact that blocks the spot.
- **Video model:** MiniMax H3 Max Turbo (`minimax/h3-max-turbo`) at 768p, 148 CU per 5 s. That's about a quarter of Kling 4.0 at 720p (581 CU per 5 s).
- **Images:** 1K only. Flux 2 Klein costs about 4 CU and Z Image about 3 CU.
- **Resolution cap:** nothing above 780p. The final file is 720x1280.
- **Budget target:** under 700 CU in total.

## Format
- **File:** 30.0 s, 9:16, **720x1280**, at the footage's native frame rate (24 or 25 fps).
- **Encoding:** H.264 (yuv420p, +faststart), AAC 48 kHz stereo.
- **Loudness:** -14 LUFS integrated, true peak at most -1 dBTP.
- **Feeds:** Reels, TikTok, Shorts. Sound on first, but it must work muted, so every spoken word is on screen.
- **Layout space:** every pixel value here is in the 1080x1920 design space used by the 10-second spot (`docs/marketing/commercial/source/`). The output is scaled by 2/3.
  - **Safe zone:** critical content stays inside x 72–990 and y 230–1450.
  - **Text floor:** 36 px in design space (24 px in the final file).

## One idea
Your pile already holds the story. Put it in order and it shows what happened.

The 10-second spot ends on one page. This spot goes one step further: the papers line up into a timeline, and three dated pages, read in order, tell the story on their own. The job is safe, then the position is eliminated, then the old job is posted online. The viewer gets the "aha" from the papers, not from us. We never state a conclusion.

## Message match (site strings, word for word)
- **Hero h1:** "You know what happened. Let’s find the page that shows it."
- **Hero sub (⚠C2):** "…into one timeline, with the page behind every fact."
- **S4 h2:** "Bring the pile. Leave with a timeline."
- **Primary CTA:** "Get my case in order"
- **K3 ✅:** "Flat price, never hourly."
- **C1 ✅,** next to the CTA: "Case IQ isn’t a law firm and doesn’t give legal advice."
- **Timeline rows:** the site's own S4 example timeline, `timelineExamples` items 1, 3 and 4 in `apps/site/src/content/examples.ts`, labelled "Example, not a real case".

## Script
| Time (s) | Picture | On screen | Voice ("Sarah") |
|---|---|---|---|
| 0.0–5.0 | **Clip 1 (the hook).** A night kitchen table, seen from above, buried in papers. Two hands slap a thick bundle down onto the pile and the sheets skid. The hands dig through the pages, searching, then pull away. Frame 1 is a 1.2x punch-in that eases out to the full frame by 1.2 s. | The "Case IQ" sender label and avatar, with bubble 1, on screen from frame 1. Bubble 2 at about 2.8. | 0.2 "You know what happened." · about 2.8 "It’s in here somewhere." |
| 5.0–11.0 | **Clip 2 (the turn).** The pile is still and the music drops out. Every sheet lifts and hangs in the air, then glides into one straight column down the table, landing in a rhythm. | Bubble 3 at about 6.0. The oldest bubble scrolls up and out, so no more than two bubbles are ever on screen. | about 6.0 "Let’s find the page that shows it." |
| 11.0–19.0 | **Hold** on clip 2's last frame, pushing in from 1.00 to 1.05 under a 35% scrim. The timeline panel lifts out of the column and its rows land one by one. | Bubble 4 at 11.0. The panel header and row 1 at about 11.6, row 2 at about 14.2, row 3 at about 16.8. | 11.0 "One timeline. The page behind every fact." |
| 19.0–24.0 | **Clip 3 (relief).** Morning in the same kitchen, seen from the side at table height, in daylight from a window. A hand closes a grey folder over the squared stack and rests flat on it. Steam rises from the mug. One steady push-in. | Bubble 5 at about 19.6. | about 19.6 "Bring the pile. Leave with a timeline." |
| 24.0–30.0 | **End card.** The ground rises over the footage, as in the 10-second spot. | In turn: the wordmark, the price line, the send pill, then the C1 fine print. Bubble 5 stays. The last frame is the poster. | about 24.4 "Case IQ. A flat price, never hourly." |

These times are targets. Retime them to the real clips and voice takes, but keep the order and the reading time.

## Overlays (DESIGN.md, "Phone Roll", as built for the 10-second spot)
- **Sender, bubbles, avatar and end card:** the same components and styles as the 10-second v4 (`docs/marketing/commercial/source/build/overlay.html`).
  - Bubbles: Bricolage 800, `wdth` 78, 72 px, fill `#e5e5ea`, left edge at x 222.
  - No more than two bubbles on screen at once. A new bubble pushes the stack up, and the oldest fades out above y 230.
- **Timeline panel (11.0–19.0):**
  - **Card:** white, with the site's card radius and card shadow.
  - **Entrance:** it is the thread's one lift. It travels from the centre of the column to its rest position in 0.28 s on `cubic-bezier(0.22,1,0.36,1)`, rotated −1.4° with the lift shadow, and stays lifted until clip 3. No spring overshoot, and it never covers a bubble.
  - **Header row:** "Your papers show" (Bricolage 600, 36 px) and the pill "Example, not a real case" (36 px).
  - **Rows:** each row sits on a vertical rail with a dot, mirroring the site's S4 timeline component (look in `apps/site/src/components`). Each row has a JetBrains Mono line (36 px) and a Source Serif 4 quote (44 px) on slate `#f1f4f8`, with the 8 px `#7c8aa0` quote rule and real quotation marks:
    1. "12 Jan 2025 · Email · page 1": “Your role is not affected by the restructuring.”
    2. "28 Jan 2025 · Letter · page 1": “Your position has been eliminated, effective today.”
    3. "3 Feb 2025 · Texts · page 4": “They posted your old job online today”
  - **Row motion:** each row lands with a small eased rise and a soft tick, then stays.
- **End card:** the 10-second v4 end card:
  - the ground `#f2f2f5` rises over the footage;
  - the wordmark (glyph and "Case IQ");
  - "Flat price, never hourly." (Bricolage 600, 50 px);
  - the indigo send pill "Get my case in order";
  - C1 at 36 px directly under the pill.
- **Indigo** appears only on the send pill.

## Footage (Krea, MiniMax H3 Max Turbo, 768p, 9:16)
- **Look:** photoreal and cinematic.
  - Night: one warm pendant lamp pools light on a wooden table, with deep charcoal shadows.
  - Morning: soft daylight from a window.
- **Palette:** paper whites, warm wood, charcoal and grey knit sleeves. Nothing red, green or yellow.
- **Content limits:**
  - no faces, no readable words, no logos;
  - no gavels, courtrooms, scales or lawyers.
- **Clips:**
  - Clip 1: 5 s. Starts on K1.
  - Clip 2: 6 s. Starts on clip 1's last frame (or K1, if that frame can't be used) and ends on K2.
  - Clip 3: 5 s. Starts on K3.
  - In total, 16 s for about 474 CU.
- **Keyframes (1K):**
  - K1: the night pile, from above.
  - K2: the same table with the papers in one column, made with K1 as the reference.
  - K3: the morning folder, seen from the side.
- **Audio:** none from the video model.

## Audio
- **Voice:** ElevenLabs TTS (eleven_v4), "Sarah" (`EXAVITQu4vr4xnSDxMaL`). All six lines in one take (about 12 CU), sliced on silences.
- **Music:** ElevenLabs Music v2.5, instrumental, one take, cut to the picture:
  - 0–5 s: a restless muted pulse;
  - a drop to near silence for the lift, at about 6.0;
  - a warm felt-piano rise through the filing;
  - a steady, quietly hopeful bed under the timeline;
  - fuller warmth for the morning;
  - one resolved chord on the end card, and silence by 29.9.
  - It's ducked 6–8 dB under the voice.
- **Sound effects:** paper rustle, a whoosh at the lift, landing taps, the folder closing, and a soft tick for each timeline row. Use free sources first: the 10-second spot's native paper sounds in `docs/marketing/commercial/source/footage/finalA.mp4` and synthesized ticks.

## Honesty rules (PRODUCT.md and the claim register)
- **Allowed claims:** it puts papers into one timeline, with the page behind every fact (⚠C2, the same gate as the hero subhead and the 10-second spot). Flat price, never hourly (K3 ✅). Not a law firm (C1 ✅, next to the CTA).
- **The example:** the timeline panel carries "Example, not a real case". We never state a conclusion about it: no "wrongful", "proof", "lied" or "win".
- **Never:**
  - "free", a reply time, a URL or a domain;
  - customers, testimonials, counts or ratings;
  - "lawyer", "legal advice" or "representation" (except in C1);
  - fear tactics or exclamation marks.
- **People:** dramatization only. Hands and forearms, no faces.

## Before it runs (the same gates as the 10-second spot)
1. The founder confirms C2.
2. The platform's AI-generated label is on.
3. It runs with a link button, targeted to Ontario.
4. The caption carries K3 and C1.

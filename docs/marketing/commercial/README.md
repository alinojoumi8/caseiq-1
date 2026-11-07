# Case IQ: 10-second commercial

- **`caseiq-10s-vertical.mp4`:** the ad.
  - Format: 1080x1920 (9:16), 10.0 s, 24 fps, H.264 with AAC.
  - Loudness: -14 LUFS, true peak -1.3 dBTP.
  - Made for Reels, TikTok, Shorts and Stories.
- **`caseiq-10s-poster.png`:** the last frame, for use as a cover or thumbnail.
- **`source/`:** everything needed to re-render it without spending Krea credits again (see the end of this file).

## The spot
| Seconds | Picture | Words |
|---|---|---|
| 0–2 | A night kitchen table, seen from above, buried in papers. Two hands search through them. A "Case IQ" sender label and avatar sit on the message bubble from the first frame. | Voice and bubble: "You know what happened." |
| 2–3 | The hands stop. Every sheet lifts and hangs in the air, and the music drops out. | (silence) |
| 3–4.5 | The sheets file themselves into one straight column, top to bottom. | Voice and bubble: "Let’s find the page that shows it." |
| 5.4–7 | A fingertip lands on one page. The page lifts out as the site's quote card: "Your papers show · Example, not a real case · Email · 12 Jan 2025 · page 1 · “Your role is not affected by the restructuring.”" | (none) |
| 7.1–10 | End card: the Case IQ wordmark, "Flat price, never hourly.", the "Get my case in order" button, and "Case IQ isn’t a law firm and doesn’t give legal advice." | Voice: "…Case IQ." |

Every word matches the site:
- the hero headline;
- the site's own job example (`apps/site/src/content/examples.ts`);
- the main call to action;
- claim K3 (confirmed);
- disclosure C1, placed next to the call to action as the claim register requires.

## Before it runs
1. **Founder confirms C2** ("every fact links to the page it came from"). The quote card dramatizes it, so it needs the same sign-off as the hero subhead.
2. **Turn on the platform's AI-generated label.** The footage is photorealistic AI, and TikTok requires the label for realistic scenes.
3. **Run it with the platform's link button, targeted to Ontario.** The ad shows no web address because the domain isn't decided yet, and searching "Case IQ" finds an unrelated Ottawa company.
4. **Post caption.** It carries the full price claim and the disclosure as text:

   > You know what happened. Let’s find the page that shows it.
   > A flat price agreed before we start, never hourly.
   > Case IQ isn’t a law firm and doesn’t give legal advice. The email shown is an example, not a real case.

5. **Site housekeeping.** `apps/site/src/content/en.ts` still marks "Flat price, never hourly" as ⚠K3, but the claim register has K3 as confirmed (2026-10-31). Update the marker so the site and the ad agree.

## How it was made
- **Keyframes** (Krea, Nano Banana Pro): the start frame (the pile, hands searching) and the end frame (the column, a fingertip on a page). There are no faces anywhere, and the text on the papers is unreadable.
- **Motion** (Krea, Seedance 2.5, 1080p): one 8 s locked overhead take, animated between the two keyframes. Two takes were rendered and the better one was kept.
- **Retiming:** a speed map shortens the still moments. A clean frame skip at about 4.2 s replaces a stretch where the model morphed paper.
- **Voice and music** (Krea, ElevenLabs):
  - voice: eleven_v4, "Sarah";
  - music: Music v2.5, instrumental, cut to the picture;
  - paper sounds: the video model's own audio.
- **Overlays and end card:** HTML in the brand's type (Bricolage Grotesque, JetBrains Mono, Source Serif 4), captured frame by frame and composited with ffmpeg.
- **Krea credits:** about 9,500 of the 39,800 that were available.

## Reviews
Three independent critics scored the ad against a written bar (every dimension at 8 or above, no blocking issues):

| Critic | First round | Final |
|---|---|---|
| Creative director | v1: 6 · 6 · 6 · 7, blocked by an AI morphing artifact | v3: 8 · 8 · 8 · 8 |
| Stressed target viewer ("Maria") | v1: 7 · 7 · 7 · 6 | v3: 8 · 8 · 8 · 8 |
| Honesty, brand and accessibility | pre-cut: 7 · 7 · 7 · 9, blocked by fine-print size | v4: 9 · 9 · 8 · 9 |

v4 is a final polish on top of v3:
- the card lift eases instead of springing;
- the price line moves out of the fine print;
- every text is at least 36 px;
- the end card arrives 0.5 s earlier;
- a whoosh lands on the 4.2 s snap.

The honesty critic re-scored v4. The other two scored v3, and v4 applies their own optional suggestions.

**Not verified:** nobody has watched it at full speed with sound. All checks were made on frames, spectrograms and loudness meters.

## Re-rendering (`source/`)
- **Command:** from `source/`, run `node build/run.mjs`.
- **Needs:** ffmpeg on PATH and the site's Playwright install at `apps/site/node_modules`.
- **Where edits go:**
  - copy, timings and the speed map: `build/config.json`;
  - overlay layout: `build/overlay.html`.
- **Output:** the video goes to `source/out/`, along with a QA set (contact sheet, key frames, loudness, guards).
- **Disk use:** the run writes about 650 MB of temporary frames to `source/build/tmp/`. Keep that folder out of git.
- **Not yet run from here:** the build hasn't been re-run from this folder. Its paths are relative, except the Playwright import, which points into this repository.

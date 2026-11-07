# Case IQ: 10-second commercial, brief v1

The user's request: "Can you use Krea mcp and generate the best 10 second commercial for case iq. It should captivate the audience."

## Format
- **Length and size:** exactly 10.0 s, vertical 9:16, 1080x1920, 30 fps.
- **Encoding:** H.264 (yuv420p, +faststart) with AAC 48 kHz stereo.
- **Loudness:** -14 LUFS integrated, true peak at most -1 dBTP.
- **Where it runs:** social feeds (Reels, TikTok, Shorts, Stories).
- **Sound and captions:** sound on first, but it must work muted, so every spoken word is also on screen.
- **Safe zone:** critical text stays inside x 72–990 and y 250–1450. Feed buttons cover the bottom ~470 px and the right edge.

## Audience (PRODUCT.md)
- **Who:** people in Ontario mid-case with little or no legal help. They hold hundreds to thousands of pages: emails, texts, screenshots, letters, bank statements and handwritten notes.
- **When and how:** on a phone, late at night, stressed, short of money, and wary of AI.
- **What they want:** to find the page that shows what happened.

## One idea
The page that shows what happened is somewhere in the pile. Case IQ puts the pile in order and finds that page.

**Message match.** The voiceover is the site's hero headline, word for word ("You know what happened. Let’s find the page that shows it."). The end-card line is the site's S4 heading ("Bring the pile. Leave with a timeline."), and the button is the site's main call to action ("Get my case in order"). Someone who taps through finds the same words.

## Script
| Time (s) | Picture | Words |
|---|---|---|
| 0.00–2.20 | One continuous overhead shot of a kitchen table late at night, buried edge to edge in papers. Two hands dig through the pile, searching. Warm lamp, cool phone glow. | Voiceover and bubble 1 at 0.30: "You know what happened." |
| 2.20–2.90 | The hands stop. Every sheet lifts off the table at once and hangs in the air: a held breath. | Silence, and the music drops out |
| 2.90–6.40 | The sheets glide into one straight, shingled column down the table and land in a rhythm. | Voiceover and bubble 2 at 3.15: "Let’s find the page that shows it." |
| 6.40–7.60 | The column is complete. A fingertip rests on one page, and a page tag pops onto that page. | Page tag at about 6.75: "p. 47" |
| 7.60–10.00 | The end card: the bubbles stay, then the wordmark, the line, the send pill and the disclaimer arrive. | Voiceover at 7.95: "Case IQ." |

**Update (v1 build).** The footage is retimed with a speed map, not a uniform 0.95x. Seedance holds the papers in the air for about 2 s and files them in about 1.5 s, so the edit squeezes the hover to about 0.8 s and plays the filing at 1x. Every event time (the music's second section, the page tag, the end card) follows the map.

The end card carries C1 from the claim register, which must sit next to the primary call to action: "Case IQ isn’t a law firm and doesn’t give legal advice." It is set in Bricolage 500, 34 px, Muted `#4f4f57`, centred under the pill, inside the safe zone.

The bubbles are set at 72 px with the first one's top at y 230, so both fit over the dark floor above the table.

## Footage (Krea)
- **Look:** photoreal, cinematic, late night.
- **Light:** one warm pendant lamp pools on a wooden table, with a cool glow from the phone.
- **Palette:** paper whites and grey knit sleeves. No red, green or yellow objects.
- **Content limits:** no faces, no readable words, no logos. No gavels, courtrooms, scales or lawyers.
- **Model:** Seedance 2.5, 9:16, 1080p, one 8 s generation.
  - The start frame is the mess with the hands searching (Nano Banana Pro keyframe).
  - The end frame is the same table with the papers in one column and a fingertip on a page.
  - The 8 s clip is retimed to 7.6 s (1.0526x).
- **Native audio:** keep the diegetic paper sounds and remove any music.

## Overlays (brand, built in post: DESIGN.md "Phone Roll")
Scale: the site's 390 px phone is about 2.77x this frame, so sizes below are already scaled.

**Received bubbles**
- **Fill and text:** fill `#e5e5ea`; text Ink `#111111` in Bricolage Grotesque 800 at `wdth` 78, 84 px, line height 1.0, letter-spacing -0.02em.
- **Shape:** padding 30px 46px, radius 72 px, and a real tail at the bottom-left corner (the site's two-patch tail, scaled).
- **Shadow:** the card shadow, scaled: `0 3px 6px rgba(0,0,0,.08), 0 22px 55px rgba(0,0,0,.06)`.
- **Bubble 1:** "You know what happened." Top at y 260, left at x 72, maximum width 880.
- **Bubble 2:** "Let’s find the page that shows it." Directly under bubble 1 with a 26 px gap; it wraps to two lines.
- **Entrance:** a spring (stiffness 480, damping 24), rising from 24 px below at 0.94 scale while it fades in. Transform origin is the tail corner.
- **Exit:** none. Both bubbles stay to the end.

**Page tag pill**
- **Text:** "p. 47" in JetBrains Mono 600, 36 px, with tabular numerals. It appears 0.2 s or more after the fingertip lands, so the viewer is the one who picks the page.
- **Pill:** white fill, a 3 px border in `#c5cae6`, radius 30 px, padding 8px 22px.
- **Shadow:** the pin shadow, scaled: `0 8px 22px rgba(0,0,0,.22)`.
- **Position:** pinned on the touched page next to the fingertip (taken from the final footage frame).
- **Entrance:** a spring (stiffness 500, damping 18) from 0.6 scale.

**End card (7.60–10.00)**
- **Ground:** Phone Ground `#f2f2f5`. It covers the footage as a sheet rising from the bottom, 260 ms on `cubic-bezier(0.22,1,0.36,1)`.
- **Bubbles:** they stay where they are, so the conversation lands in the brand world.
- **Wordmark:** the ChatGlyph SVG (below) about 104 px tall, next to "Case IQ" in Bricolage 800, `wdth` 78, 140 px, Ink. Centred, about y 880–1020.
- **Line:** "Bring the pile. Leave with a timeline." in Bricolage 600, 50 px, `#2b2b31`, centred, about y 1090.
- **Send pill:** Action Indigo `#2438a8`, 150 px tall, a full pill (`999px` radius), centred, about y 1240–1390.
  - Its label is "Get my case in order" in Bricolage 700, 54 px, white.
  - A 100 px white circle at the right holds an indigo right arrow.
  - Shadow: `0 17px 39px rgba(36,56,168,.35)`.
- **Arrival order:** the wordmark at 7.75 (fade and rise 20 px, 260 ms), the line at 7.95, then the pill at 8.15 on a spring (stiffness 480, damping 24).
- **Hold:** the final frame holds and works as the poster frame.
- **ChatGlyph:**
  ```svg
  <svg viewBox="0 0 30 26">
    <path d="M6 1h18a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5H13l-7 5v-5a5 5 0 0 1-5-5V6a5 5 0 0 1 5-5z" fill="#111"/>
    <path d="M8 8h14M8 13h9" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
  </svg>
  ```
- **Fonts:** Bricolage Grotesque (variable, with the `wdth` axis), JetBrains Mono, from Google Fonts.

## Audio
- **Voiceover:** ElevenLabs TTS (eleven_v4), voice "Sarah" (calm, reassuring).
  - Three lines, placed at 0.30, 3.15 and 7.95 s.
  - About -16 LUFS short-term on each line.
- **Music:** ElevenLabs Music v2.5, instrumental, 10 s, in four parts:
  - a restless muted pulse;
  - a drop to a held breath around 2.3 s;
  - a warm felt-piano and mallet rise;
  - one resolved chord at the end card.
  - Ducked 6–8 dB under the voice.
- **Paper sounds:** native from Seedance: rustle, whoosh and landings.
- **Ending:** the mix fades to silence by 10.0 s.

## Honesty rules (PRODUCT.md, claim register)
- **Allowed claims:** it organizes papers into one timeline, with the page behind every fact.
- **Never:**
  - "free", a reply time, a price, a URL or domain (undecided);
  - customers, testimonials, counts or ratings;
  - "lawyer", "legal advice" or "representation";
  - outcome promises ("win");
  - fear tactics or exclamation marks.
- **People:** dramatization only. No real people and no faces.

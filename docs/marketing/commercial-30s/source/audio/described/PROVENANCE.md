# Audio description take: provenance

This is the voice for the described version of the 30-second film (WCAG 1.2.5). The site's film player offers that version behind an "Audio description" switch. The describer uses a different voice from the film's narrator ("Sarah"), so listeners can tell a description from the film itself.

| Detail | Value |
|---|---|
| File | `ad_take1.mp3` (29.04 s, one take, sliced on its pauses) |
| Made | 2026-11-06 |
| Tool | Krea, model `elevenlabs/tts`, `model_id` `eleven_v4` |
| Voice | "Eric" (`cjVigY5qzO86Huf0OWal`) |
| Krea job | 2b7820e7-ea0e-413b-ba77-5487ca11ac46 |
| Cost | about 28.4 compute units |

## Script
The take contains exactly these four lines:

1. A table piled with papers, at night.
2. The papers rise, and land in one straight column.
3. A timeline rises, marked: example, not a real case. Each dated row shows its page: an email saying your role is not affected, a letter saying your position has been eliminated, and texts.
4. On screen: Case IQ isn't a law firm and doesn't give legal advice. Pictures, voice and music made with AI.

## Where the lines fall in the take
`silencedetect` at -35 dB with a minimum of 0.35 s finds these pauses in the take.

| Line | Speech in the take (s) |
|---|---|
| 1 | 0.00–2.58 |
| 2 | 3.25–6.19 |
| 3 | 6.91–20.17. It has internal pauses at 8.65–9.07, 10.88–11.45, 13.39–13.81, 16.15–16.60 and 18.96–19.44. |
| 4 | 20.78–29.04. It has an internal pause at 21.39–21.96 (after "On screen:") and at 25.50–26.07. |

## Accuracy of the descriptions
- **Line 4:** describes the end-card line "Pictures, voice and music made with AI." That line appears only in the site cut of the film.
- **Line 3:** paraphrases the timeline rows, which come from `apps/site/src/content/examples.ts`.

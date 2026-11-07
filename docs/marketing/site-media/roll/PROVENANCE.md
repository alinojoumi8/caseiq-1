# Camera-roll images: provenance

These are original images generated for the Case IQ marketing site's camera roll, the hero's former roll and the S4 filing scene. They replace tiles that used to be drawn in CSS. They show **example documents**. The text in them is machine-generated and not real; the files here are exactly as generated, and what is done to their text is at the foot of this page.

| Detail | Value |
|---|---|
| Made | 2026-11-06 |
| Tool | Krea, model `bfl/flux-2-klein` |
| Settings | 1K resolution, 4 steps, cfg 1 |
| Cost | about 1.5 compute units each |
| People | none: no people, hands, faces, logos or real names |

| File | Tile | Aspect | Seed | Krea job | Prompt |
|---|---|---|---|---|---|
| t1-chat.png | 1 (texts, 2x2) | 1:1 | 4101 | fb88fcaa-eade-4062-9de6-29f28ad5b65e | A flat smartphone screenshot of a text message conversation, seen straight on and filling the whole frame. White background, a thin status bar at the top, then rounded light grey message bubbles on the left and rounded bright blue message bubbles on the right, each holding one or two short lines of small text. Crisp, clean, evenly lit. No phone frame, no hands, no photos, no emoji, no logos. |
| t2-note.png | 2 (meeting notes) | 1:1 | 4102 | 007a61c3-b088-481d-961f-e001896f9341 | Close-up top-down photograph of a page of handwritten meeting notes on a cream lined notepad: a date written at the top and five short lines of quick handwriting in blue ballpoint ink, with one word underlined. Soft natural daylight, faint paper texture, the page fills the frame. No hands, no pen, no other objects. |
| t3-letter.png | 3 (letter) | 1:1 | 4103 | 25cea539-c2ab-41b0-92ba-4c34922d3251 | Close-up top-down photograph of the top of a printed business letter on bright white paper, filling the frame: a thin dark band at the top, a date line, a short address block and the first paragraphs of small black type. Lying flat on a desk in soft even daylight. No logo, no signature, no hands, no other objects. |
| t4-email.png | 4 (email) | 1:1 | 4104 | 89084569-2f27-419e-b01d-fca2a2f9f5c1 | Close-up top-down photograph of a printed email on white paper, filling the frame: four short header lines in small black type at the top, a thin grey rule beneath them, then two short paragraphs of small black type. Lying flat in soft even daylight. No logo, no hands, no other objects. |
| t5-letter2.png | 5 (letter page 2) | 1:1 | 4105 | 6228b6c4-8172-4691-ba39-1871a3147056 | Close-up top-down photograph of the second page of a typed letter on white paper, filling the frame: several paragraphs of small black type, with one short line in bold near the middle and a small page number at the bottom. Lying flat in soft even daylight. No logo, no signature, no hands, no other objects. |
| t6-posting.png | 6 (job posting, 2x1) | 16:9 | 4106 | 2e1ffb16-796e-4aad-80f4-d302f1ca75ad | A flat screenshot of a job posting web page, seen straight on and filling the whole frame: a white page with a bold dark job title near the top left, a row of three small grey rounded tags under it, then several lines of small grey text, and one solid blue rounded button on the right. Crisp, clean, evenly lit. No browser frame, no logos, no photos of people. |

Tiles 7 and 8 are the duplicates that the S4 scene sets aside. They are second photographs of documents already in the roll: tile 7 of the letter (t3, turned 4 degrees, warm, shadow bottom right) and tile 8 of the email (t4, turned -3 degrees the other way, a little cooler and brighter, shadow top right, framed tighter and lower). `apps/site/scripts/roll-assets.mjs` derives them, with no new generation.

## What is done to the text after generation

The generator draws text that is not words ("Bed eot" as a job title), and at the sizes the tiles are shown it can be read. So `apps/site/scripts/roll-assets.mjs` works on each source in memory, before any tile is cut from it (tile 7 inherits from tile 3, tile 8 from tile 4). The files here are never changed.

| Source | What the script does |
|---|---|
| t1-chat.png (tile 1) | Paints out every bubble but one. That one is given the example case's own line, "They posted your old job online today", with a small date header, "3 Feb 2025". The garbled camera glyph in its header is painted out in the header's colour. Both come from `apps/site/src/content/examples.ts`; the script checks that they are there. |
| t6-posting.png (tile 6) | The title reads "Operations Coordinator" and its one tag "Full-time" (the quote's "full-time", as a tag), both from `examples.ts`. The other tags and the button carry no text. The body lines are blurred (sigma 11) until they are lines of type and nothing more. |
| t2-note, t3-letter, t4-email, t5-letter2 (tiles 2 to 5, 7, 8) | Softened at tile size, after the cut (the sources are cut down 4.7x, so a blur at source size is lost): the typed pages (tiles 3, 5, 7) by sigma 1.9 all over, the email (tiles 4 and 8) by 2.5, and the handwritten note (tile 2) by sigma 4.6 on its ink alone: the page without the writing (paper, shading and ruling) is estimated as the median along each row, the ink is what is darker than it, and that ink layer is blurred and laid back on the page, so the ruling runs sharp and unbroken through the writing and the faintest strokes are softened with the rest. No letter can be made out at 216px or at 3x of it. |

The painted text is set in Geist (SIL Open Font License), the file Next ships in `node_modules/next/dist/compiled/@vercel/og/`, through sharp. Bubble colour and radius, and the page's white, are the image's own (the second bubble is kept as the bubble; the rest of the screenshot is not redrawn). No other words appear anywhere in the roll.

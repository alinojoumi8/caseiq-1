# The 30-second film, site cut

- **`caseiq-30s-vertical-site.mp4`:** the cut of the film that the website plays.
  - Format: 720x1280 (9:16), 30.0 s, 24 fps, H.264 with AAC 48 kHz stereo.
  - Loudness: -14.1 LUFS, true peak -1.3 dBTP.
  - MD5 `eed0bbe98d5486a7a66966d2412a9bcc`.
- **The ad is unchanged.** `../caseiq-30s-vertical.mp4` (MD5 `2386dddaab70864785d80cd849efc842`) still re-renders byte for byte with the default command.

## How it differs from the ad
Picture, voice, music and timing are the ad's, frame for frame, up to the end card at 23.7 s. Only the end card changes:

| | The ad | The site cut |
|---|---|---|
| "Get my case in order" button, drawn in indigo at 24.15 s | yes | **no**. Nobody can press a picture of a button, and an indigo button that does nothing breaks the site's rule that indigo means pressable. The site puts a real send pill under the film instead. |
| Fine print | "Case IQ isn't a law firm and doesn't give legal advice." | the same line, then **"Pictures, voice and music made with AI."**, so the file carries its own AI label wherever it is copied to |
| Layout | panel, wordmark, price line, button, fine print | panel, wordmark, price line, fine print. The fine print moves up under the price line, and the whole card sits 90 px lower so it stays centred. |

The voice never mentioned the button, so the captions file does not change.

## How it was made
From `../source/`, with ffmpeg, Python and the site's Playwright install (the same needs as the ad):

```
node build/run.mjs --cut site --tmp-dir <a folder outside the repo> --out-dir <a folder outside the repo>
```

- `--cut site` (or `CASEIQ_CUT=site`) is read by `build/lib.mjs`. It renames the output (`cuts.site.outName` in `build/config.json`), moves the end card to `cuts.site.endPanelTop`, and tells `build/overlay.html` to leave out the `#pill` row, add the AI line and re-stack the card. `build/qa.mjs` knows the pill is absent, so its guards still run.
- The command is free: it reads local footage and audio and calls no Krea service. It fetches the three brand fonts from Google Fonts for the overlay frames, as the ad's render does.
- Leaving `--cut` out renders the ad, unchanged.
- The site copies this file byte for byte to `apps/site/public/film/case-iq-film-30s.mp4` (`npm run film:assets` in `apps/site`, which checks the MD5, the streams and the loudness first).

# Case IQ marketing site

Next.js 16 (App Router, Turbopack), Tailwind 4, GSAP (ScrollTrigger) for animation and Lenis for smooth wheel scrolling on desktop. All visible copy lives in `src/content/en.ts` (keyed by the IDs in `docs/marketing/copy-deck.md`); nothing is hard-coded in components.

Read `AGENTS.md` first: this Next.js version has breaking changes, and its docs are in `node_modules/next/dist/docs/`.

## Run it

```bash
npm install
npm run pw:install   # once: downloads the Chromium that shots and a11y use
npm run dev          # http://localhost:3000
```

Production build, locally:

```bash
npm run build
npm start -- -p 3100
```

## Scripts

| Script | What it does |
|---|---|
| `dev` | Development server. |
| `build` | `next build`. Passes while founder placeholders are still unset. |
| `build:prod` | `npm run lint:launch && next build`. Fails until everything the founder owes is set. |
| `build:herenow` | The here.now preview: a static export in `out/` with the Site Data manifest. See "here.now preview" below. |
| `start` | Serves the production build. |
| `lint` | ESLint. |
| `typecheck` | `tsc --noEmit`. |
| `lint:copy` | Scans `src/content/*.ts` for banned words (copy rules, brief section 3). |
| `lint:launch` | Fails while any `siteConfig` field is null (`turnaroundDays`, `contactEmail`, `mailingAddress`, `legalEntity`; there is no price field, since pricing is a flat fee per case), any string still holds a `[bracketed]` placeholder, or any conditional-claim marker (`// ⚠K1`) names a claim that is not in `confirmedClaims`. Fails by design before launch; not part of `test`. |
| `test` | Vitest: schemas, API routes, delivery, content, FAQ JSON-LD, and the here.now manifest, mapping and privacy variants. |
| `shots` | Playwright screenshot set into `.shots/<RUN_ID>/` with an `index.md` of what each image shows, behaviour checks, overflow and console results. Needs a running site: `BASE_URL=http://localhost:3100 RUN_ID=my-run npm run shots`. `TARGETED=convo` runs only the conversation sheet set (into `.shots/convo-r2/`); `TARGETED=film` runs only the hero film message, film player and hero intro set (into `.shots/film-r1/`). |
| `a11y` | axe on the page in many states (dialogs, popovers, FAQ, the closing launcher, the conversation sheet at each step, waitlist) and the legal pages. Exits 1 on any serious or critical violation. `BASE_URL=... npm run a11y`. |
| `pw:install` | Installs the Playwright Chromium. |
| `film:assets` | Rebuilds the film's web files from the site cut of the film (`docs/marketing/commercial-30s/site-cut/`) and its source footage (needs ffmpeg): the hero clip, the stills, the posters, the captions, the audio-described version (from the voice take in `source/audio/described/`) and `src/content/media.ts`. Re-run it instead of editing those by hand. |
| `roll:assets` | Derives the eight camera-roll tiles in `public/roll/` (WebP, 25 KB or less each) from the six source images in `docs/marketing/site-media/roll/` and writes their provenance to `src/content/roll.ts`. Before any tile is cut it works on the sources in memory: the chat and the job posting get the example case's own words painted in (the generator's text is not words), and the paper photos are softened at tile size (the note's ink only, so its ruled paper stays sharp); the files in `docs/` are never changed. Uses sharp (installed with Next) and the Geist file Next ships; no network. Re-run it instead of editing the tiles by hand. |
| `icons` | Writes `src/components/world/solar-icons.ts` (generated): only the Solar icon bodies the site uses, from the `@iconify-json/solar` dev dependency. No icon is fetched at run time. To use another one, add it to the script's list and run it. Solar is by 480 Design, licensed CC BY 4.0. |

`public/film/` holds those files: the 30 s film (a byte copy of the site cut: the approved ad without its drawn button and with the AI line on its end card), its English captions, two posters, the extended audio-described version and its captions, the silent hero clip `hero-snap-640.mp4` and the clip's first and last frames (`hero-pile-*`, `hero-column-*`). Everything in it is AI-generated and is labelled as such on the page. `/film-text` is the film's text version as a page of its own (no JavaScript needed).

## Motion

Section reveals: `SectionMotion` (mounted once on the home page, lazy, only while motion is allowed) brings in each section below the hero. Its headings reveal word by word with SplitText (the split is reverted once it has played, and the heading keeps its full accessible name); a heading with markup in it fades and rises whole; the section's messages then rise 16px in order, always after their heading. A heading or message comes in when it crosses one line: 8px above the sticky reply bar on a phone, 88% of the way down the screen elsewhere. A Tab into a section, a click on an in-page link to it, or a hash lets the whole section in at once. Only what is below the fold when it runs is hidden, by script, and a print rule and a before-print reveal show everything. Because a route you leave stays mounted but hidden (cacheComponents), everything it makes is reverted when the route is hidden and made again on return, and what has already arrived is not hidden a second time. `gsap.ts` also stops the two things ScrollTrigger starts for ever as it registers (a frame loop and a 250ms interval), so a phone does no frame work at rest.

GSAP is the only animation system (no Motion). The registration, the named eases and the two springs are in `src/lib/motion/`; the media queries that decide what moves are in `queries.ts`. That module is always loaded lazily, after hydration, so GSAP stays out of the first paint: the hero thread, the Ask thread and the S4 filing scene render finished and a sibling `*Motion` component plays them in (`HeroMotion`, `AskMotion`, `PileMotion`). With reduced motion those components do nothing. `HeroMotion` also plays the hero intro: a script in the root layout's head adds `html.js-motion` before the first paint (only when motion is allowed), `hero.css` holds the intro's pieces down until `HeroMotion` starts, and the head script removes the class after 2.5 s if it never does. `FilmMessage` (the hero's film message) plays its silent clip once after the intro; `FilmPlayer` (mounted once, next to the conversation sheet, loaded after hydration by `FilmPlayerSlot`) opens the 30-second film or its text version; if its code fails to load, a tap on the film message goes to `/film-text`. Every lazily loaded piece goes through `lazyPiece` (`src/lib/motion/lazy.tsx`), which turns a failed chunk into a component that renders nothing, inside a `Quiet` error boundary, and the motion pieces mount only while `prefers-reduced-motion` allows motion (`useMotionAllowed`), so reduced motion downloads no GSAP. `app/error.tsx` and `app/global-error.tsx` keep Quick exit and double-Esc if anything else throws. `SmoothScroll` (mounted once in the layout) runs Lenis only for a mouse or trackpad on a screen that hovers, with motion allowed; it stops while a dialog or menu is open, so inner scrollers carry `data-lenis-prevent`.

## here.now preview

`npm run build:herenow` builds a static export of the site in `out/`, for a private preview on [here.now](https://here.now). here.now hosts static files only, so this build differs from the normal one in four ways. The normal build (`npm run build`, `npm start`, the API routes, Resend delivery) is unchanged.

- **The forms save to here.now Site Data.** There is no server, so each form posts its answers from the browser to `/.herenow/data/requests` (the request form) or `/.herenow/data/waitlist` (the early-access list). The collections are declared in `herenow/data.json`, which the build copies to `out/.herenow/data.json`. Both collections are insert-public and **read-owner**: only the owner's account can read the records, because they hold names and email addresses. `tests/herenow.test.ts` fails if a read ever becomes public.
- **The bot checks run in the browser.** A filled honeypot, or a form sent under 3 seconds after it appeared, shows the normal success message without sending anything. Any non-2xx answer (400, 403, 429, 5xx) or a network failure shows the normal "wasn't sent" message with the email address.
- **The preview is hidden from search engines.** `robots.txt` disallows everything, every page has `<meta name="robots" content="noindex, nofollow">`, and the sitemap line is left out of `robots.txt`.
- **Three privacy-notice sections read differently** ("Where it goes", "Where it is stored", "Cookies and tracking"), because the answers are saved with here.now and here.now supplies visit counts. The variants are in `src/content/legal.ts` (`privacyHerenow`). Counsel must review them with the rest of the page.

### Build it

```bash
npm run build:herenow
```

The first publish has no URL yet, so build once like that and publish the **contents of `out/`**. Then rebuild with the real here.now URL, so the canonical origin, the Open Graph image URL and the sitemap use it, and publish again:

```bash
# PowerShell
$env:NEXT_PUBLIC_SITE_URL = "https://your-slug.here.now"; npm run build:herenow

# bash, zsh or Git Bash
NEXT_PUBLIC_SITE_URL=https://your-slug.here.now npm run build:herenow
```

How it works, so it holds no surprises: `scripts/build-herenow.mjs` copies the app into `.herenow-build/` (without `src/app/api/`), runs `next build` there with `NEXT_PUBLIC_HERENOW=1`, copies the export to `out/`, checks it (noindex on every page, `robots.txt`, no `/api/` calls, private reads), and deletes the copy. Nothing in `src/` is moved. Why a copy: a static export always writes Next's scratch files to `./.next`, so building in a copy keeps the normal build's `.next/` safe while `next start` is running. The export also turns Cache Components and Partial Prefetching off, because a static export cannot prerender `robots`, `sitemap` or the Open Graph image while they are on. The Open Graph image is written as `opengraph-image.png`, since a static host cannot label an extensionless file as an image. Anything under `out/.herenow/` (the publish script's state) is kept when `out/` is rebuilt.

### Where the submissions go

Open the Site's Manage view on the here.now dashboard and look in its Database section: the collections are `requests` and `waitlist`. Or read them with the owner API and your API key:

```bash
curl -sS "https://here.now/api/v1/publishes/{slug}/data/requests?limit=50" -H "Authorization: Bearer $HERENOW_API_KEY"
curl -sS "https://here.now/api/v1/publishes/{slug}/data/waitlist?limit=50" -H "Authorization: Bearer $HERENOW_API_KEY"
```

Each record holds the form's answers in snake_case fields and the exact consent wording the person saw (`consent_text`); `created_at` is when they agreed. here.now limits: 10 submits per hour per IP for each collection, 1,000 record creates per hour per Site. Site Data needs an account-owned Site: on an anonymous publish the form posts are refused (403) until the Site is claimed.

## Launch gate

**The host's build command must be `npm run build:prod`**, not `npm run build`. That makes a deploy fail while anything is still unset.

Fill these in `src/content/site.ts` (`siteConfig`) before launch. There is no price field: pricing is a flat fee set per case from the client's needs and how complex the case is, so no starting price is published.

- `turnaroundDays`: days to a first timeline (number).
- `contactEmail`: the contact address used in the "Prefer email?" line, the success and error messages, the CASL consent text and the legal pages. Where it appears in body text it is a tappable `mailto:` link (not inside the consent checkbox labels).
- `mailingAddress`: the mailing address for the CASL consent text and the legal pages.
- `legalEntity`: the legal entity name for the copyright line, the CASL sender line and the legal pages.
- `confirmedClaims`: the claim IDs the founder has confirmed (claim register B and C), for example `['K1', 'C10']`.

Also resolve any remaining `[bracketed]` text in `src/content/*.ts` and the "To be confirmed" items on `/privacy`, `/terms` and `/accessibility` (counsel must review those pages).

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Sets `metadataBase`, sitemap and JSON-LD URLs. |
| `NEXT_PUBLIC_QUICK_EXIT_URL` | Where Quick exit goes. Default `https://www.google.ca`. |
| `RESEND_API_KEY`, `LEAD_TO_EMAIL` | Both set: leads are emailed through Resend. In production with neither, the lead routes return 503 and the form shows its error. |
| `LEAD_FROM_EMAIL` | Optional sender for those emails. |

In development, leads are appended to `.data/leads.jsonl` (gitignored).

`NEXT_PUBLIC_HERENOW=1` switches on the here.now mode. `npm run build:herenow` sets it for you; do not set it for the normal build.

# Case IQ

Case IQ is a planned tool for people in Ontario handling a court or tribunal case with little or no legal help. It's designed to turn a pile of legal documents into one organized case, with every fact linked to the page it came from, so a person can understand their own matter and bring it to a lawyer, a legal clinic or a hearing.

Case IQ isn't a law firm and doesn't give legal advice. It doesn't predict outcomes, judge anyone's credibility, or draft or file court documents.

## Where it stands

Case IQ is pre-launch. This repository holds:

- **the marketing site** in [`apps/site`](apps/site/), with a request form and an early-access list;
- **the product plan** in [`docs/product`](docs/product/README.md): a full specification of the app, which isn't built yet;
- **the design system and product context** the site was built from.

## What's here

| Path | What it holds |
|---|---|
| [`apps/site/`](apps/site/) | The marketing site: Next.js 16, Tailwind CSS 4 and GSAP. Its [README](apps/site/README.md) covers every script, the here.now preview build, the launch gate and the environment variables. |
| [`docs/product/`](docs/product/README.md) | The product specification: vision, personas, journeys, architecture, AI and evidence design, security, privacy and legal risks, and the roadmap. It includes a [fictional sample case](docs/product/sample-case/README.md) for testing. |
| [`docs/marketing/`](docs/marketing/) | The copy deck, the [claim register](docs/marketing/claim-register.md) (the facts and product claims the site may use, with sources, allowed wording and conditions), and the 10-second and 30-second ads with their sources. |
| [`PRODUCT.md`](PRODUCT.md) | Who Case IQ is for, its positioning, its hard limits and the copy rules. |
| [`DESIGN.md`](DESIGN.md) | The marketing site's design system: colour, type, components and motion. [`.impeccable/`](.impeccable/) holds its machine-readable companion and the design decisions. |

## Run the site

It's built and tested with Node.js 24 and npm 11.

```bash
cd apps/site
npm ci
npm run dev   # http://localhost:3000
```

To run the checks in a fresh clone, generate the route types first:

```bash
npx next typegen
npm run typecheck
npm run lint
npm run lint:copy
npm test
npm run build
```

`npm run build:prod` also runs the launch gate. It fails on purpose while any launch detail is unset, such as the turnaround time, or any claim on the page is still unconfirmed. See [Launch gate](apps/site/README.md#launch-gate).

## How the site works

- **Copy.** All visible text lives in `apps/site/src/content/`, keyed to the copy deck, and none is written into components. `npm run lint:copy` checks it for banned words, and the launch gate checks that every conditional claim has been confirmed.
- **Motion.** GSAP is the only animation system, and it loads after the page renders. Headings reveal word by word, the film plays in its own player, and Lenis smooths scrolling on desktop with a mouse or trackpad. With reduced motion turned on, the motion pieces don't mount and GSAP isn't downloaded.
- **Safety.** Every page has Quick exit, for anyone who shares a device or isn't safe at home.
- **Access.** The target is WCAG 2.2 AA. The film has captions, a text version and an audio description, and `npm run a11y` runs axe on the page in many states.

## Media and credits

- The film's pictures, voice and music, and the camera-roll photos, are made with AI, and the site says so. The case they show is an example, not a real case. Provenance notes sit beside the sources, for example [`PROVENANCE.md`](docs/marketing/site-media/roll/PROVENANCE.md) for the photos.
- Icons: [Solar](https://www.figma.com/community/file/1166831539721848736) by 480 Design, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Fonts: Bricolage Grotesque, Source Serif 4 and JetBrains Mono, loaded through `next/font`.

## Licence

There's no licence, so the default copyright rules apply: you're welcome to read the code, but it isn't licensed for reuse. The Solar icon data in `apps/site/src/components/world/solar-icons.ts` stays under CC BY 4.0.

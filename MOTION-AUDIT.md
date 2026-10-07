> Historical review. CREATIVE-AUDIT.md documents the current colorful studio design and current measurements.

# Typography and live-studio follow-up — 6 October 2026

## Root causes and corrections

- Headline masks placed whitespace inside clipped inline blocks; tight leading and absolute hero-copy coordinates made type crowded. General Sans replaces Clash Display, actual spaces sit between word masks, and wrapped headlines have more line clearance.
- Hero copy and CTAs now use document layout. The composition responds to viewport height as well as width; the hero CTA is visible at 1440 × 600 and 375 × 667.
- The previous demand canvas stopped when input stopped. A manually advanced R3F canvas now shares GSAP's ticker with Lenis. A single tonal studio shader appears while assets load and stays live throughout the page.
- Model scale now follows the available viewport column. The laptop uses its source display mesh for a live product preview. The server faces the camera instead of presenting its side.
- The needle-like quartz has been replaced by a sourced cut gem. Its own facets assemble into the complete object; assembly and completed-object transforms match.
- The mobile gem originally collided with the solutions heading. It now clears before the full-width text enters. Minor feature labels and survey legends are immediately readable.
- Each normal-flow headline now owns one reveal, including its serif line. The master still sequences primary camera, object and story-type actions.

## Captured flow

| Step | Surface | Current checks |
| --- | --- | --- |
| 1 | Hero | General Sans + Instrument Serif, separated copy/object regions, visible CTA in short windows. Pass. |
| 2 | Three problem beats | Sourced window, server and padlock; camera/object/type sequencing; one visible chapter. Pass at captured positions. |
| 3 | SleekViber reveal | Cut gem reassembly and readable title, distinct visual and copy columns. Pass. |
| 4 | Solutions | Immediately visible feature names; mobile sculpture clears before text. Pass. |
| 5 | Questionnaire | Q1/Q2 always visible, keyboard selection, max-three, exclusive all, error retry, receipt focus and confetti. Pass. |
| 6 | About / footer | Clear typography, functional waitlist controls and anchor links; reduced-motion flow. Pass. |

32 screenshots were captured at 375, 768, 1440 and 1920 pixels, including every problem beat. DOM checks found zero word-rectangle collisions, zero hero headline/copy collisions and zero horizontal overflow. Saved contact sheets were visually inspected. Follow-up screenshots at 1440 × 600 and 375 × 667 verified the short-window CTA and mobile solutions fix. Reduced-motion screenshots at 390 pixels showed no canvas, all three chapters in document flow, and no overflow.

These are viewport and interaction checks, not a claim of full accessibility compliance or proof against every possible intermediate scroll position.

## Functional checks

The production build and ESLint pass. Browser captures and interactive form checks recorded no console errors.

The browser test selected Q1 with the keyboard, blocked a fourth Q2 choice, verified exclusive All of the above, simulated a failed POST and retried successfully. The saved receipt was focused at 112px from the viewport top; confetti canvases appeared; returning-voter questions remained visible. A separate authenticated stats read confirmed that the browser submission appeared in admin analytics.

API checks: invalid shapes 400, valid response 201, duplicate 409, unauthenticated stats 401, unauthenticated admin 307, signed httpOnly session, valid waitlist signup. Tests used a separate SQLite file; real questionnaire data was preserved.

## Motion and performance limits

Lenis uses lerp 0.12 with one GSAP ticker callback; scroll events call ScrollTrigger.update and lag smoothing is disabled. R3F advances from that same ticker rather than scheduling a second render RAF. Scroll progress remains in mutable refs. DPR stays capped at 1.5 desktop / 1.1 touch. The renderer unmounts when the tab is hidden.

An 18-second full-page production scroll test measured 30 fps on the Chrome test surface, with a 33.4ms median and 33.8ms p95. A fresh-profile baseline with 3D disabled also measured 30 fps. This test surface therefore does not establish a 60 fps result. No universal 60 fps claim is made.

Actual WebGL draw activity was recorded (3,362 draw calls across the test), and screenshots 1.3 seconds apart confirmed idle motion. A real wheel event progressed to about 411px after 90ms and settled at its 800px target. Headless frame timing is not a substitute for profiling the user's browser and display.

## Fonts and assets

- General Sans, weights 400/500/600: [Fontshare](https://www.fontshare.com/fonts/general-sans), locally hosted through next/font; license in app/fonts/GeneralSans-LICENSE.txt.
- Instrument Serif italic, JetBrains Mono and Inter remain locally hosted.
- New cut gem: [Quaternius / Poly Pizza](https://poly.pizza/m/kbgiCMzdxg), CC0, 15KB GLB; generated with gltfjsx 6.5.3. Source geometry is retained; a neutral physical material replaces its green atlas.
- Laptop, broken window, server, padlock and local studio HDR source credits remain in public/models/LICENSES.txt.

No mouse tracker, colored glow, glass card, gradient headline, wireframe centerpiece or decorative landing divider was added.

## Evidence

### Accepted visual checkpoints

1. Hero — short laptop window, with the CTA visible.

![Hero at 1440 by 600](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/motion-short-1440-top.png)

2. Problems — server geometry facing the viewer.

![Problem chapter two](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/motion-1440-problems2.png)

3. Reveal — sourced cut gem and separated title.

![SleekViber reveal](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/motion-1440-reveal.png)

4. Solutions — mobile text is clear of the sculpture.

![Mobile solutions](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/motion-short-375-solutions.png)

5. Questionnaire — immediate question legends.

![Questionnaire](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/motion-1440-questionnaire.png)

6. About — typography and waitlist surface.

![About and waitlist](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/motion-768-about.png)

Local screenshots and runnable QA scripts:
C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/

Relevant files: motion-overview-375.png, motion-overview-768.png, motion-overview-1440.png, motion-overview-1920.png, motion-short-1440-top.png, motion-short-375-solutions.png, motion-performance.json, qa-motion-final.mjs, qa-motion-performance.mjs, qa-motion-baseline.mjs, qa-motion-form.mjs.


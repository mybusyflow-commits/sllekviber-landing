# Redesign acceptance audit

Historical redesign report. The current typography, curated gem, live render clock and performance limits are documented in [MOTION-AUDIT.md](MOTION-AUDIT.md). Frame-rate measurements below apply to the earlier scene, not the current live studio.

Completed 6 October 2026. The app is in `C:\desktop files\sleekviber`.

## Root causes replaced

- The scene used hand-built geometric centerpieces. Those objects and their animation system were replaced with five curated GLBs and a local studio HDR.
- The old scroll callback wrote transforms and opacity to every problem, solution and headline on each tick. Entrance/exit windows overlapped. The replacement uses authored sequential tweens in one master timeline; the canvas renders on demand.
- The questionnaire component was mounted, but a saved-vote flag replaced its entire form with a celebration. Long pinned sections also buried it behind roughly fifteen screens of storytelling. It now remains in normal document flow for both fresh and returning visitors, with direct survey links in the header and hero.
- First appearances of different materials caused shader-compilation stalls. Parallel preparation and a cached contact shadow removed those stalls in the recorded hardware test.
- A new headline queue initially delayed visible survey text behind off-screen headlines during fast navigation. Unseen headings now finish immediately; direct-jump screenshots confirm the form headings remain readable.

## 1 — Curated assets: PASS

| Beat | Artist / source | License | Shipped GLB |
| --- | --- | --- | --- |
| Hero laptop | [Alex Safayan, Laptop](https://poly.pizza/m/27hcX_w47Jb) | CC BY 3.0 | 105 KB |
| Broken frontend | [Eric Chadwick / Wayfair, Glass Broken Window](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlassBrokenWindow) | CC BY 4.0 | 242 KB |
| Backend / data | [Jeremy Eyring, Server](https://poly.pizza/m/6ijQclm8jxw) | CC BY 3.0 | 687 KB |
| Security | [Quaternius, Padlock](https://poly.pizza/m/2ZSHgKVr3F) | CC0 | 34 KB |
| Reassembly / standards | [iPoly3D, Crystal](https://poly.pizza/m/7iHQpCXTb7) | CC0 | 14 KB |

Lighting: [Greg Zaal / Poly Haven, Studio Small 03](https://polyhaven.com/a/studio_small_03), CC0, local 1K HDR. Full attribution and modifications are in `public/models/LICENSES.txt`, linked in the footer.

All models have typed gltfjsx components, useGLTF loading/preloading and Center normalization. Contact shadows sit beneath the studio on desktop; touch omits shadows for performance. Window/server textures were resized to 512px. The reassembly fragments come from the sourced crystal's own facets. There are no hand-built primitive centerpieces.

## 2 — Typography: PASS

Locally hosted, preloaded through next/font/local: unmodified [Clash Display](https://www.fontshare.com/fonts/clash-display), Instrument Serif italic, JetBrains Mono and Inter. Browser font-face checks confirmed all four actual font faces loaded. Next's unused display fallback face is not a font failure.

SplitReveal uses overflow masks, yPercent 110 to 0, expo.out, one-second entrances and .035-second word stagger. The display/serif pairing, mono indices and hairlines carry the design.

## 3 — Responsive composition: PASS

Captured hero, problems, reveal, standards, questionnaire and footer at 375, 390, 768, 1440 and 1920px. Document width equalled viewport width in every capture. Visual review checked text/object separation and corrected the hero object scale. Desktop hero size is 13.4vw: 192.96px at 1440 and 257.28px at 1920. Touch headlines use the fluid minimum instead of overflowing.

## 4 — Scroll choreography: PASS

One master ScrollTrigger sequences camera settlement, object action, type reveal, hold and exit. Consecutive problem chapters do not overlap. HTML headline entrances queue one at a time and skip unseen items during fast navigation. Camera/object actions settle before normal-flow standards animate. Every scoped trigger is reverted on cleanup; fonts and resize measurements refresh the master.

Lenis uses `lenis.on('scroll', ScrollTrigger.update)`, GSAP's ticker calling `lenis.raf(time * 1000)`, and `gsap.ticker.lagSmoothing(0)`. There is no second RAF loop or React state update per scroll frame. Anchor navigation immediately settles the scroll target so an active wheel gesture cannot pull the survey shortcut back. Touch uses native scrolling. Reduced-motion capture confirmed all three problem chapters visible, no canvas and no overflow. The operating system cursor remains native; no mouse tracker is rendered.

## 5 — Questionnaire and dashboard: PASS

Chrome exercised Q1 with Enter, attempted a fourth Q2 choice (blocked), selected exclusive All of the above, simulated a failed POST (inline error with enabled retry), retried successfully and confirmed the saved-vote flag. After reload, both fieldsets and the form remained present and the submit button was disabled. The success message matches the requested copy. Successful submission launches two burnt-orange confetti bursts; reduced motion suppresses them. The final receipt check confirmed a second canvas for confetti, the receipt visible at 112px from the viewport top, and focus on `survey-receipt`. Split headlines retain separate screen-reader text; visual masks are hidden from the accessibility tree. Clicking the survey shortcut during an active wheel gesture reached the questionnaire at scrollY 6797 without being pulled back by inertia.

Authenticated `/admin` displayed the submitted answer and updated totals. Tests used an isolated SQLite file, leaving the real survey database unchanged. The unauthenticated stats API returned 401 and `/admin` redirected to login with 307. Invalid empty, four-choice and mixed All-of-the-above payloads returned 400. A valid response returned 201; its immediate duplicate returned 409. The admin cookie was httpOnly. Waitlist storage also succeeded.

## 6 — Performance and technical gates: PASS on tested hardware

Production Chrome traversed the entire page over 18 seconds on NVIDIA GeForce RTX 3050 Laptop GPU / ANGLE D3D11: 1,080 sampled animation frames, **60 fps**, median **16.7ms**, 95th percentile **17ms**, maximum **17.9ms**, **zero frames over 33ms**. This is a measurement on that laptop, rather than a guarantee for every device. Software-rendered screenshot tests were used for layout checks, not the hardware performance claim.

Demand rendering, cached materials/geometries, parallel shader preparation, a single cached 128px contact shadow, local assets, desktop DPR capped at 1.5 and touch DPR capped at 1.1 support that result. No runtime console errors were captured during valid production journeys. `npm run build` and `npm run lint` completed successfully.

## 7 — Banned patterns: PASS

The active app/components/hooks/lib/config audit returned zero matches for colored gradient/glow styling, gradient headlines, backdrop-blur cards, CSS box shadows, wireframes/grid helpers, primitive centerpiece constructors, custom cursor hiding, scanlines, default spinner motion and purple/violet styling. Layout uses typography and hairlines rather than rounded feature boxes. One burnt-orange accent is used for controls, small markers, restrained studio rim light and submission confetti.

## Evidence

QA captures, browser scripts and JSON results are saved in the task's visualization directory at `C:\Users\techt\.codex\visualizations\2026\10\03\01a100db-6a69-7ba3-9017-3fa32379ca46`. Key records: `phase5-final-visual.json`, `phase5-queue-check.json`, `phase5-font-check.json`, `phase5-reduced.json`, `phase5-perf-final.json`, `phase5-receipt.json`, `phase5-anchor.json`. See README for setup, environment variables and dashboard access.

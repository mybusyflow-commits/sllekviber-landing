# Creative studio audit — 6 October 2026

## Delivered direction

The user selected **colorful creative studio with expressive motion**. The landing now uses warm ivory, forest typography and a continuously moving mint/coral fabric backdrop. The admin keeps its dark utility theme. This supersedes the earlier black-only direction.

Preview: http://localhost:3002. Dashboard: http://localhost:3002/admin.

## Root causes and fixes

- The earlier black treatment and subdued background made the live experience difficult to perceive. A sourced Silk shader now runs in the same persistent canvas as the models, with reading-area attenuation.
- Fragile word-mask spacing and constrained sticky viewports made large type unreliable. Font-ready GSAP SplitText masks replace handmade negative-margin masks. Leading, word spacing and viewport-height sizing now leave distinct regions for text, models and controls.
- Visual review found a real tablet collision: the completed laptop covered feature body copy. The model now clears before Solutions below 1024px and on touch. Wide touch screens otherwise retain the appropriate scene column.
- Mobile hero controls needed separate placement below the model. The questionnaire submit bar was becoming sticky before answers were complete; it now becomes sticky only when both questions are answered.
- Shared glTF loader configuration could restore a remote Draco decoder path. Every active loader and preload now uses the local decoder, with WASM and JavaScript fallback files.
- Lenis and CSS both applied header clearance, producing a 196px navigation gap. Lenis now uses the CSS scroll margin alone; the measured final anchor offset is 100px.
- The historical report that the questionnaire was absent cannot be assigned a definitive cause from this current build. Its current implementation is explicitly in normal flow, outside pinned story layers, and remains visible on return after voting. Both questions were verified in desktop, mobile, touch and reduced-motion modes.

## Sources and fonts

| Active asset/component | Source | License / adaptation |
| --- | --- | --- |
| Floating laptop model and scene pattern | [Poimandres floating-laptop](https://github.com/pmndrs/examples/tree/main/examples/floating-laptop) | Repository MIT notice included; original geometry and screen artwork retained, studio materials, interactive lid and source-part assembly |
| Server rack, Jeremy Eyring | [Poly Pizza](https://poly.pizza/m/6ijQclm8jxw) | CC BY 3.0; credited locally, normalized and relit |
| Padlock, Quaternius | [Poly Pizza](https://poly.pizza/m/2ZSHgKVr3F) | CC0; normalized and relit |
| Moving Silk background | [React Bits Silk](https://reactbits.dev/backgrounds/silk) | MIT + Commons Clause notice included; adapted into the existing Canvas with mint/coral color and legibility controls |
| SplitText implementation pattern | [React Bits SplitText](https://reactbits.dev/text-animations/split-text) | Same notice; font-ready masks, scoped cleanup and sequential headline queue |
| Studio Small 03 HDR, Greg Zaal | [Poly Haven](https://polyhaven.com/a/studio_small_03) | CC0; local 1K studio lighting |

Fonts are locally hosted **Clash Display**, **Instrument Serif italic**, **Inter**, and **JetBrains Mono**. A fresh browser confirmed the primary display, serif, body and mono faces loaded. No font service request is required at runtime. Full asset notices live in `public/models/LICENSES.txt` and `public/credits/REACT-BITS-LICENSE.txt`.

## Acceptance results 1–7

1. **Sourced geometry — pass.** All scene centerpieces use the artist-created laptop, server or padlock. The reveal reassembles the laptop's own mesh parts. No primitive-generated hero objects. A plane is used solely to render the sourced background shader.
2. **Typography — pass for the current responsive design.** Clash/serif contrast, mono indices, generous spacing and GSAP word masks are active. Font loading was checked. Hero size intentionally fits its text column and viewport height rather than retaining the earlier rigid 13vw rule; measured sizes were 58.4px at 375px and 119.52px at 1440px.
3. **Layout — pass in tested viewports.** 32 captures at 375, 768, 1440 and 1920px found no horizontal overflow, headline word collisions or hero-copy intersection. Raw visual review also caught and resolved the tablet body-copy/model collision. This is evidence for these captured layouts, not an exhaustive browser or localization guarantee.
4. **Motion and interaction — pass in the tested flow.** One master GSAP timeline controls mutable scene refs; chapter camera, object and text actions are sequenced. Continuous fabric motion is secondary to the story action. Lenis uses `lenis.on('scroll', ScrollTrigger.update)`, GSAP ticker RAF and `lagSmoothing(0)`. The same ticker advances R3F; no frame-by-frame React state. The laptop opens/closes, anchor clearance is 100px and navigation back to the hero restores visible text. Native cursor only; no mouse tracker. Touch uses native scrolling. Reduced motion removes the canvas and exposes all three problem chapters as readable normal-flow content.
5. **Questionnaire and admin — pass end to end.** Keyboard selection, maximum-three enforcement, exclusive All of the above, simulated failed POST with inline retry, successful submission, focused receipt, two confetti bursts, localStorage duplicate guard and visible returning form were checked. The saved answer appeared in the authenticated admin page. Waitlist storage was also verified.
6. **Performance and technical checks — pass on the measured laptop.** An 18-second full-page browser scroll recorded 1,080 frames: 60fps, median 16.7ms, p95 17.0ms, maximum 19.3ms and zero frames over 33ms. Renderer: NVIDIA RTX 3050 Laptop through ANGLE/D3D11. The background also rendered while idle. Final production build and ESLint passed. Fresh-browser interaction checks reported zero console errors or warnings; all model, HDR and decoder requests were local. DPR is capped at 1.35 desktop / 1 touch. This does not establish 60fps on every device; Lighthouse and physical-phone performance were not measured.
7. **Visual-pattern audit — pass for the public landing.** Source searches in app/components/hooks found no wireframe, radial-gradient, gradient-text, backdrop-blur, scanline, RGB-split, hidden cursor or torus/sphere/box centerpiece patterns. The landing section border search found only the functional email-field underline. There are no decorative section dividers, glass feature cards, purple/blue glows or cursor tracker. Administrative table rules and keyboard focus/selection indicators remain functional UI.

## Flow health

| Step | Result | Evidence |
| --- | --- | --- |
| Hero | Pass | Separate display/copy/model regions; mobile actions beneath the model; actual lid control works |
| Problems | Pass | One chapter visible per beat; source laptop/server/padlock; all chapters readable with reduced motion |
| Reveal | Pass | Original laptop parts assemble into the finished source model; title remains clear |
| Solutions | Pass | Numbered typography instead of cards; scene clears on narrow/touch layouts |
| Questionnaire | Pass | Two visible fieldsets, accessible controls, API retry/success and admin confirmation |
| About / coming soon | Pass | Readable manifesto, working waitlist and footer anchors/credits |

### Functional safety checks

- Unauthenticated stats: HTTP 401. Unauthenticated admin: HTTP 307 redirect.
- Invalid questionnaire payloads: HTTP 400. Accepted submission: HTTP 201. Immediate duplicate: HTTP 409.
- Admin session cookie verified httpOnly; authenticated stats and recent response confirmed.
- Tests used a separate SQLite database on port 3001. The real database was checked read-only: six legacy responses and one current pulse response; QA did not add production submissions.

## Accepted screenshots

### Hero

![Current hero](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-final-hero.png)

### Problems

![Problem chapter](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-1440-problems.png)

### Reveal

![SleekViber reveal](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-1440-reveal.png)

### Solutions

![Solutions](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-1440-solutions.png)

### Questionnaire

![Visible questionnaire](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-1440-questionnaire.png)

### About

![About and coming soon](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-1440-about.png)

### Mobile and touch

![375px hero](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-375-top.png)

![768px touch feature layout](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-touch-tablet.png)

### Saved response and admin

![Survey receipt](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-receipt.png)

![Authenticated admin](C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/creative-admin.png)

## Machine evidence

Current reports and QA scripts are in:
`C:/Users/techt/.codex/visualizations/2026/10/03/01a100db-6a69-7ba3-9017-3fa32379ca46/`

- `creative-responsive.json`: 32 layout captures and collision checks.
- `creative-interactions.json`: local assets, fonts, lid, anchors, touch, reduced motion and console checks.
- `creative-form.json`: keyboard, max-three, exclusive-all, failure/retry, receipt and returning voter.
- `creative-performance.json`: final 18-second frame-timing measurement.

Limitations: no Lighthouse score, physical-phone frame measurement or comprehensive accessibility certification is claimed. Existing metadata and API/auth architecture were preserved. Earlier AUDIT.md and MOTION-AUDIT.md describe historical designs.

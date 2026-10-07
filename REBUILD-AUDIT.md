# SleekViber: design and motion rebuild

## Root causes found
- The earlier palette change preserved the same hero structure and repetitive placeholder screen. It did not address the user's typography or storytelling complaints.
- The studio could become empty after hero text exited. Independent solutions type reveals could compete with the master scene timeline.
- The source-part reveal and assembled model used separate placement calculations. A shared normalized placement now owns both.
- The solutions model stayed visible too long and could cover the first standards row. Its exit now precedes the grid's reading area.
- The questionnaire was present in the inspected build. The remaining mobile obstruction was its sticky submit layer; submission now stays in normal flow.
- Turning reduced motion off at runtime enabled the master before child headline masks existed. SplitReveal now listens for media changes and announces readiness; the master waits for those masks. This was traced from browser warning stacks and verified by switching the preference both ways.

## Audit results
1. **Sourced 3D:** Nicholas-3D MacBook, Benny Weimer circuit board, ProAnimator phone. No hand-built primitive centerpiece. Artist geometry, texture detail and PBR maps are retained. Neutral softboxes, local licensed HDR lighting and desktop contact shadows support the surfaces. Old unused rendering components were removed.
2. **Typography:** local Clash Display variable headlines and General Sans body/controls. Hero scale is 13.1vw on desktop; word-mask reveals use expo.out and 0.035s stagger. No public mono eyebrows, serif decoration, section numbering or emoji.
3. **Layout:** dark graphite, warm white and silver. Open two-column standards layout with minimal Lucide icons, no generic feature-card containers. Header scrolls away; native cursor retained. Four-width inspection and confirmation both passed: 375, 768, 1440, 1920px; no horizontal overflow, intersecting headline words, hero/body collisions or visible heading clipping. The screen-reader-only heading is intentionally excluded from clipping checks.
4. **Choreography:** one GSAP master sequences camera, object and type phases. The laptop remains after the hero copy exits. Source parts assemble centrally, the brand exits, the laptop settles beside the solutions introduction, and that headline enters under the same master. Lenis uses scroll-to-ScrollTrigger sync and the GSAP ticker with lagSmoothing(0); R3F uses that ticker too. No React state updates per animation frame. DPR caps: desktop 1.5, touch 1.25.
5. **Questionnaire:** normal-flow visible section, original questions/options retained. Keyboard Enter selects; fourth pain point is rejected with a hint; All of the above is exclusive. Simulated 503 yields inline retry; actual POST saved in isolated SQLite; confetti appeared, receipt received focus at about 32px from viewport top, local voted flag saved. On reload both questions remain visible and submission is disabled. Five malformed survey payloads and an invalid email returned 400.
6. **Dashboard and data:** saved Pretty annoyed / All of the above response appears in authenticated stats and rendered dashboard at 375/1440px. Unauthorized stats: 401; admin redirect: 307; authenticated stats: 200; session cookie httpOnly. Identical polls no longer replay chart animations. Reduced motion bypasses chart/count animation. Real database read-only check: six legacy responses and one pulse response preserved. QA used a separate database.
7. **Build/runtime:** production build and TypeScript passed for all 11 routes. Lint passed with no warnings. Reduced-motion presentation: no canvas, all three story chapters and both fieldsets readable, no overflow at 375px. Runtime preference restoration recreates the canvas and both hero masks. Final normal/reduced/restored/admin checks emitted zero errors or warnings. An earlier confirmation's warning entries are preserved as diagnostic evidence and superseded by rebuild-runtime-final.json.

## Acceptance checks
- No purple/blue glows, gradient headline text, scanlines, wireframe scene objects, raw box/sphere/torus centerpieces, backdrop-blur cards, cursor tracker or emoji in active app source: source search returned no matches.
- Public separators, decorative numbering and persistent header are absent. Functional form borders and data chart bars remain.
- Three-dimensional lighting and broad tonal background motion continue at rest. Touch uses native scrolling and a lighter lighting/rendering configuration; reduced motion prioritizes readable content.
- Final performance measurement: 18-second full-page scroll at emulated DPR 1.5, 1,075 animation frames / **59.72 fps**, median 16.7ms, p95 17.1ms; three frames exceeded 33ms, maximum 50.1ms. Chrome ANGLE, NVIDIA RTX 3050 Laptop GPU. This is a measurement on this machine, not a locked-60fps guarantee on every device. Lighthouse was not run; no Lighthouse score is claimed.
- Canvas drawing was instrumented: 7,051 draw calls during the run, including 770 idle-test draws; idle screenshots differed, confirming continuous rendering. Wheel movement settled gradually (239px at 90ms, 533px after settling for the emulated scaled input). No runtime exceptions.
- The 1200 × 630 sharing image is an actual screenshot of the rebuilt hero; generation emitted no browser errors or warnings.

## Asset sources
- [Nicholas-3D MacBook](https://sketchfab.com/3d-models/macbook-07f012fbd3bb4c37a1b9ed08533ee403), CC BY 4.0, via [React Widgets](https://github.com/SpaceHolderdJs/react-widgets), MIT.
- [Benny Weimer circuit board](https://polyhaven.com/a/circuit_board), CC0.
- [ProAnimator phone](https://sketchfab.com/3d-models/iphone-18-pro-max-high-quality-3d-model-5e40716caa274a789de5b17798ee2e78), CC BY 4.0, via React Widgets. Canonical source ID is recorded in public/models/LICENSES.txt.
- [Studio Small 03](https://polyhaven.com/a/studio_small_03), Greg Zaal, CC0.
- [React Bits Silk and SplitText](https://github.com/DavidHDev/react-bits), MIT + Commons Clause; notices retained.
- [Clash Display](https://www.fontshare.com/fonts/clash-display) and [General Sans](https://www.fontshare.com/fonts/general-sans), Fontshare; local licenses preserved.

## Evidence
Codex visualization workspace: before-rebuild-*.png, rebuild-responsive.json, rebuild-confirm-responsive.json and their screenshots, rebuild-form.json, rebuild-admin.json, rebuild-runtime-final.json and rebuild-performance.json. README.md documents setup and admin environment variables. DESIGN.md records the current system; previous audit screenshots are superseded.

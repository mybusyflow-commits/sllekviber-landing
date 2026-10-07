# Presentation audit — October 6, 2026

## What changed
- The public page uses self-hosted General Sans regular, medium and semibold. Unused public font preloads were removed; the admin type system is route-scoped.
- Navigation is positioned in the hero's normal scroll space and leaves the viewport immediately with page movement. There is no fixed header or cursor tracker.
- Removed section indices, option indices, eyebrows, repeated marketing slogans, monospaced decorative labels, ornamental arrow glyphs, the laptop preview toggle and unused film-grain CSS.
- Headline and body roles are consistent. Copy describes the coming-soon platform accurately. The model-screen artwork uses the same family and contains no numbered lists.
- Survey and email controls keep clear labels, visible keyboard focus, disabled/loading/error feedback and touch targets. The successful survey receipt confirms saving without claiming the unreleased platform already solves every problem.
- 404 and visual-loading states now match the public presentation.

## Verification
- `npm run lint`: pass.
- `npm run build`: pass, including TypeScript and all 11 generated routes.
- Batched responsive inspection: 28 captures spanning 375, 768, 1440 and 1920px; no horizontal overflow, intersecting headline word bounds or hero/body collisions. All seven main story positions were included. Four final hero confirmations retain the same results after font-route cleanup.
- Header bounding boxes leave the viewport at every scrolled story checkpoint. Example at 375px: header top is -1568px in the data chapter.
- Font computed family: locally hosted `studio` (General Sans), regular body and medium display. No decorative serif or mono appears in the public flow.
- Reduced motion: no canvas, all three chapters visible in normal flow, two survey fieldsets present, no overflow at 375px.
- Survey test at 390px: Enter selects an option; fourth pain point is blocked with a visible hint; All of the above replaces individual choices; a simulated 503 displays an inline error and permits retry; real POST succeeds, confetti canvas appears, saved receipt receives focus at ~32px from the viewport top; voted flag is saved; questions remain visible and submit is disabled on reload.
- Authenticated stats confirm the submitted Pretty annoyed / All of the above response. Unauthenticated stats return 401; admin redirects with 307; signed cookie is httpOnly; authenticated stats return 200. The rendered admin contains the saved answers.
- QA uses a separate SQLite file. Read-only verification of real data: six legacy responses and one pulse response preserved.
- Performance: 18-second full-page scroll, 1078 frames / 59.89 fps, median 16.7ms, p95 17.2ms, one 49.9ms frame. Chrome ANGLE, NVIDIA RTX 3050 Laptop GPU. Canvas draw calls were instrumented; idle images changed and idle draws continued. Wheel movement progressed from 406px at 90ms to 800px after settling. This is a measurement on this machine, not a guarantee for every device.

## Runtime fixes found during confirmation
The first reduced-motion layout pass could build a timeline before the parent's passive effect populated its state, producing empty GSAP-target warnings. The hook now checks the media query synchronously before creating any timeline.

Three r182's environment convolution emitted ANGLE X4008/X4122 warnings while optimizing its general GGX sampler for its fixed normal-view input. A scoped compatibility adapter substitutes the mathematically equivalent normal-view expression only for that shader signature. Other shaders and diagnostic reporting remain intact. A numerical comparison over 327,680 samples had maximum component error 6.72e-10; fresh-cache development and production checks emitted no warnings. The final reduced-motion and authenticated admin paths also emitted no warnings; the intentional 404 network entry was the only expected error entry. The adapter restores the renderer's original shaderSource on teardown. Revisit this adapter when upgrading Three.js.

The intentional nonexistent-URL test returns HTTP 404; that expected network entry is distinct from a JavaScript exception.

## Asset sources
- Nicholas-3D MacBook: https://sketchfab.com/3d-models/macbook-07f012fbd3bb4c37a1b9ed08533ee403 — CC BY 4.0, delivered through the MIT React Widgets template.
- Benny Weimer circuit board: https://polyhaven.com/a/circuit_board — CC0, local 1K PBR maps and Draco compression.
- ProAnimator phone: https://sketchfab.com/3d-models/iphone-18-pro-max-high-quality-3d-model-5e40716caa274a789de5b17798ee2e78 — CC BY 4.0, through React Widgets.
- React Bits Silk and SplitText patterns: https://github.com/DavidHDev/react-bits — MIT + Commons Clause, notices preserved.
- General Sans: https://www.fontshare.com/fonts/general-sans — local license preserved.

Complete model notices: public/models/LICENSES.txt and public/credits/REACT-WIDGETS-NOTICE.txt.

## Skills and evidence
Applied the installed Taste, Impeccable typeset/distill and UI/UX Pro Max guidance. Impeccable's Windows launcher failed with a missing cache-directory batch label, so context and references were read directly and typography was audited with rendered/source evidence.

Evidence files live in the Codex visualization workspace: presentation-responsive.json, presentation-confirmation.json, presentation-form.json, presentation-admin.json, presentation-final-paths.json, presentation-performance.json and presentation-*.png. Earlier audit documents describe superseded designs.


# Dark metallic presentation audit

## Direction and implementation
- Replaced the colorful studio with graphite `#0A0A0B`, warm white `#EEECE7`, muted platinum `#B7B5B1` and silver `#C8CDD0`.
- Artist-created laptop, circuit board and phone retain their geometry and PBR surface detail. Mapped albedo is rendered monochrome; normal and ARM maps remain intact. There are no new primitive centerpiece objects.
- Neutral studio softboxes and a slow physical key-light sweep reveal the hardware surfaces. React Bits Silk provides continuous tonal background motion; phone highlights are attenuated to protect reading contrast.
- The headline settles before the laptop lid opens. User scrolling cancels the introduction and transfers ownership to the single master timeline. Problem objects use wider dolly/rotation ranges; the reveal assembles the laptop's actual parts.
- Retained locally hosted General Sans, clear normal-flow navigation, native cursor and the visible questionnaire. Favicon, confetti and the 1200 × 630 sharing image now match the metallic palette.

## Verification
- `npm run lint`: passed.
- `npm run build`: passed, including TypeScript and all 11 routes.
- First responsive batch: 28 screenshots across 375, 768, 1440 and 1920px, covering seven story positions. No horizontal overflow, intersecting headline words or hero/body collisions; no browser errors or warnings.
- Final confirmation after mobile highlight attenuation: 375 and 1440px hero and selected-survey screenshots. Correct dark background and local font; two fieldsets visible; selection background `rgb(36,38,40)`, text `rgb(238,236,231)`; submit enables after both questions are answered. No errors, warnings or overflow.
- Reduced motion at 375px: no canvas, all three story chapters visible in normal flow, both survey fieldsets present, no overflow.
- Final selection checks stubbed only the survey-start telemetry request to avoid adding production data. No responses were submitted during this palette-only confirmation. The prior end-to-end survey, retry, duplicate, confetti and authenticated-dashboard checks are recorded in `PRESENTATION-AUDIT.md`; those logic paths were preserved.
- Performance: an 18-second full-page scroll measured 1,077 animation frames, **59.83 fps**, median 16.7ms and p95 17.2ms. Two frames exceeded 33ms; maximum 50.1ms. Tested in Chrome ANGLE on an NVIDIA RTX 3050 Laptop GPU. This is measured performance on this machine, not a locked-60fps guarantee for every device.
- Instrumented canvas drawing continued at rest (672 draws during the idle test), and idle screenshots changed. An 800px wheel input moved to 361px at 90ms, then settled at 800px, confirming gradual Lenis scrolling. No runtime exceptions.
- Production preview: `http://localhost:3004/`; dashboard: `/admin`. Existing survey data and dashboard functionality are unchanged.

## Sourced assets
- [Nicholas-3D MacBook](https://sketchfab.com/3d-models/macbook-07f012fbd3bb4c37a1b9ed08533ee403), CC BY 4.0, via the MIT React Widgets template.
- [Benny Weimer circuit board](https://polyhaven.com/a/circuit_board), CC0.
- [ProAnimator phone](https://sketchfab.com/3d-models/iphone-18-pro-max-high-quality-3d-model-5e40716caa274a789de5b17798ee2e78), CC BY 4.0, via React Widgets.
- [React Bits Silk and SplitText](https://github.com/DavidHDev/react-bits), MIT + Commons Clause; notices retained.
- [General Sans](https://www.fontshare.com/fonts/general-sans), self-hosted with local license.

Full model attribution and modifications: `public/models/LICENSES.txt`.

## Evidence
The Codex visualization workspace contains `metallic-responsive.json`, `metallic-confirmation.json`, `metallic-performance.json`, and the corresponding `metallic-*.png` screenshots. `DESIGN.md` describes the current system; earlier colorful screenshots are superseded.

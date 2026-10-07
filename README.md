# SleekViber

A coming-soon experience for a vibe-coding platform in development. The public landing tells the quality story with one persistent React Three Fiber scene and a GSAP scroll timeline. The Builder Pulse questionnaire, email waitlist, and private analytics dashboard are functional today.

## Run
Use Node.js 24 or newer (the app uses Node's built-in SQLite driver).

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set the admin variables.
3. Run `npm run dev`.

Open the landing at http://localhost:3000 and the dashboard at http://localhost:3000/admin. Run `npm run build` and `npm run start` for the production build.

## Environment

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Password for `/admin/login` |
| `ADMIN_SESSION_SECRET` | Random secret of at least 32 characters used to sign the httpOnly admin cookie |
| `NEXT_PUBLIC_SITE_URL` | Optional public origin for Open Graph metadata |
| `SLEEKVIBER_DB_PATH` | Optional SQLite file path; defaults to `data/survey.db` |

The dashboard and stats API require an authenticated admin session. The dashboard refreshes every 15 seconds.

## Data
The questionnaire records one sentiment answer and up to three pain points. “All of the above” is exclusive. The server whitelists answers, rejects invalid payloads, and deduplicates identical submissions from one address within 60 seconds. The browser also stores a voted flag. A separate start event supports the completion-rate metric. Email signups are saved to the waitlist table.

Responses live in SQLite at `data/survey.db`. This build creates `pulse_responses`, `survey_starts`, and `waitlist` tables. Six responses from the previous questionnaire remain in the legacy `responses` table and are shown as a separate preserved count. Builds do not reset data. Deployment needs a persistent writable filesystem or a managed database.

## Experience
- Next.js App Router, TypeScript, Tailwind, R3F/Three.js, GSAP ScrollTrigger and Lenis.
- Dark metallic studio: graphite, warm white, silver moving surfaces and neutral softbox reflections. The admin retains its dark utility theme.
- One fixed canvas and one master scroll timeline. Background motion comes from React Bits Silk; the hero uses Nicholas-3D's MacBook through the React Widgets template. A Poly Haven circuit board and ProAnimator phone complete the story. The reveal assembles the laptop's own parts.
- Every model, HDR, font and Draco decoder ships locally. Sources and licenses are linked in the footer and listed in public/models/LICENSES.txt.
- GSAP and Lenis share one ticker with the manual R3F renderer. DPR is capped at 1.5 desktop / 1.25 touch. Hidden tabs pause by unmounting the canvas. Touch scroll is native; reduced motion presents the same readable content without 3D.
- Locally hosted Deltha from the supplied font archive for public headlines and General Sans for body copy and controls; GSAP SplitText masks animate headings after fonts load. Device screens fit the new lettering to their width. The supplied demo license allows testing but requires a commercial license for a business launch; see app/fonts/Deltha-LICENSE.pdf.
- Native cursor, modest magnetic desktop controls and accessible survey micro-interactions. Hero navigation scrolls away; no cursor tracker, preview toggle or decorative numbering.
- The questionnaire remains visible after voting. Its saved notice and disabled submit prevent accidental repeats.

See PRODUCT.md for scope, DESIGN.md for the current visual system and REBUILD-AUDIT.md for current screenshots and acceptance checks. The feature copy describes the platform in development, not functionality already available in this landing. Older audit files describe superseded designs.



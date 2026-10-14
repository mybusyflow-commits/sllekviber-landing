# SleekViber

A coming-soon experience for a vibe-coding platform in development. The public landing tells the quality story through an animated website concept, scroll-stacking scenes, and GSAP choreography. The Builder Pulse questionnaire, public aggregate results, email waitlist, and private analytics dashboard are functional today.

## Run
Use Node.js 24.x (the app uses Node's built-in SQLite driver).

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set the admin variables.
3. Run `npm run preview` for a background preview that stays running after the command exits. Use `npm run dev` for a foreground development server.

Open the landing at http://localhost:3005, the survey and public results at http://localhost:3005/#questionnaire, and the private dashboard at http://localhost:3005/admin. Expand **See the survey results** beneath the questionnaire for public totals. Run `npm run build` and `npm run start` for a foreground production server. Local URLs work on this computer; they are not public hosting. Restart the preview after a computer reboot. The launcher safely reuses a healthy preview and writes diagnostic logs to `.local/preview/preview.out.log` and `.local/preview/preview.err.log`, outside the build output that Next.js clears.

After a production build, `npm run preview:qa` starts an isolated production preview on port 3006. It uses `.local/qa/survey.db` and separate test credentials, overrides hosted storage, and cannot write test submissions to the real SQLite or Neon database. Use `127.0.0.1:3006` for admin browser testing so its cookie is isolated from the main localhost preview. The QA launcher is optional; the public website uses the main configuration.

## Environment

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Unique password of at least 12 characters for `/admin/login`; example placeholders are rejected |
| `ADMIN_SESSION_SECRET` | Random secret of at least 32 characters used to sign the httpOnly admin cookie |
| `NEXT_PUBLIC_SITE_URL` | Optional public origin for Open Graph metadata; otherwise uses Vercel's deployment domain or local port 3005 |
| `SLEEKVIBER_DB_PATH` | Optional SQLite file path; defaults to `data/survey.db` |
| `DATABASE_URL` | Server-only Neon PostgreSQL connection URL; selects hosted storage when set |

The dashboard and stats API require an authenticated admin session. The dashboard refreshes every 15 seconds.

## Data
The questionnaire records one sentiment answer and up to three pain points. “All of the above” is exclusive. The server whitelists answers, bounds JSON reads to 4 KiB and 10 seconds, rejects cross-site requests, and deduplicates identical submissions from one address within 60 seconds. The browser also stores a voted flag. A separate start event supports the completion-rate metric. Email signups are saved to the waitlist table. Database-backed request limits protect polling, voting, telemetry, email signups and login attempts across restarts and instances. Client IP headers are trusted only behind Vercel's edge; local clients share a bucket and cannot spoof forwarded headers to bypass it.

Local responses live in SQLite at `data/survey.db`. This build creates `pulse_responses`, `survey_starts`, `waitlist`, and operational `request_limits` tables. Six responses from the previous questionnaire remain in the legacy `responses` table and are shown as a separate preserved count. Builds do not reset data. When `DATABASE_URL` is set, all poll, start-event, waitlist and dashboard operations use Neon PostgreSQL over HTTP. A Vercel deployment without this variable rejects database operations rather than writing an ephemeral SQLite file.

## Vercel database setup

Use [Neon through Vercel Storage](https://vercel.com/marketplace/neon/neon). [Vercel does not support a shared persistent SQLite file](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel).

A [SleekViber Neon project](https://console.neon.tech/app/projects/nameless-salad-69410646) was provisioned on 14 October 2026 in AWS US East (Ohio), with a `production` branch (`br-soft-band-b4i4qv8b`) and the `sleekviber` database. Connection configuration, survey schema setup, and migration are still pending. Reuse this project rather than creating a duplicate. The app continues to use local SQLite until `DATABASE_URL` is configured.

The Vercel project `sleekviber` has also been prepared, with Node 24.x and Next.js configuration. Its IDs are recorded in `data/vercel-setup.json`. No deployment has been created: publication is waiting for hosted database configuration and verification. The latest scoped API check returned 403 for `shreyanshkrishna279-6139s-projects`; connected-account/team access must also be resolved. Reuse this Vercel project.

1. Connect the existing SleekViber Neon project to the Vercel project's Storage integration. Keep function placement near the database region.
2. Set the connection URL as `DATABASE_URL` in Vercel. Keep it server-only; never prefix it with `NEXT_PUBLIC_`. Set `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` and `NEXT_PUBLIC_SITE_URL` as well.
3. For the one-time setup, put the intended database's connection URL in your ignored `.env.local` or export it in your shell. Run `npm run db:setup`. This creates the five tables and indexes without resetting existing data. Run it again on an existing hosted database to add the new request-limit table.
4. Run `npm run db:migrate -- --dry-run` to inspect local record counts, then `npm run db:migrate` to transfer the existing SQLite records. The migration reads a consistent source snapshot, commits inserts in one hosted transaction, preserves existing IDs, and leaves SQLite untouched. Rerunning it does not duplicate those records.
5. Run `npm run db:check` to verify the hosted connection and table counts, then deploy/redeploy. Set the Vercel Node version to 24.x; this is also declared in `package.json`.

Use separate Neon branches/databases for Preview and Production so preview votes do not enter live analytics. Setup/migrate against the intended branch explicitly. No cloud connection is attempted during `next build`, and schema setup is an explicit command rather than work performed on each function request.

Without `DATABASE_URL`, `npm run db:check` validates the local SQLite integrity and reports counts. `npm run db:backup` makes a new verified SQLite snapshot in `data/backups/`, including committed WAL data. Backups are ignored by Git and never overwrite a prior backup. Keep durable copies outside the deployment checkout before replacing a server or migrating. Hosted backups are managed through Neon.

After `npm run build`, run `npm run test:database` for isolated persistence, validation, concurrent duplicate, admin-access, security-header, asset and backup tests. Run `npm run test:security` for request parsing and session checks, and `npm run lint` for application linting. The suites use temporary databases and never submit test votes to the real database. Hosted queries still require verification with a real Neon connection URL. `/api/health` reports storage readiness without exposing records or credentials. See [SECURITY.md](SECURITY.md) for the current audit evidence and remaining limitations.

## Experience
- Next.js App Router, TypeScript, Tailwind, GSAP ScrollTrigger and Lenis.
- Black, paper, charcoal and vermilion; locally hosted Clash Display and General Sans.
- React Bits ScrollStack, GridMotion and GlareHover templates anchor the experience. Magnet, MagnetLines, ScrollFloat, TextPressure, SplitText and PixelTransition are adapted to the shared design system. Sources and licenses are credited at public/credits/DESIGN-NOTICE.txt.
- The hero adapts the existing Poimandres floating-laptop template through React Three Fiber and Drei. A fixed “Look inside” control reveals illustrative request and access layers. Motion can be paused, honors reduced motion, and stops outside the visible hero or in a hidden tab. Rendering uses one local model, a local studio environment, demand frames and capped resolution. The survey CTA stays fixed and cannot be dragged.
- Three React Bits problem scenes stack on desktop; their controls illustrate design, complete journeys and permissions.
- The wire landscape uses Canvas 2D. Its full brand signature fits the viewport. The standards accordion uses semantic website, saved-data, permissions, journey and search previews alongside each description. The hero mounts its own isolated WebGL scene; the old scene containing multiple models remains archived.
- Desktop scrolling uses one Lenis instance integrated with GSAP, with shorter wheel inertia and anchor transitions. Touch scrolling remains native; narrow views use normal chapter flow. Reduced motion retains readable content and working state controls.
- The questionnaire remains visible after voting, with saved feedback and a disabled submit button.
- Below the questionnaire, a native disclosure shows public counts and answer percentages. It uses the existing database through `/api/responses/results`; that route queries only aggregates and exposes total/today/q1/q2. The private `/api/responses/stats` remains protected. Legacy responses and individual response records are excluded from the public view. Results refresh every 30 seconds while open; loading/error/empty states remain explicit.
See PRODUCT.md for scope, DESIGN.md for the current visual system and REBUILD-AUDIT.md for current screenshots and acceptance checks. The feature copy describes the platform in development, not functionality already available in this landing. Older audit files describe superseded designs.

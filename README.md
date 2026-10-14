# SleekViber

A coming-soon experience for a vibe-coding platform in development. The public landing tells the quality story through an immersive color-field hero, interactive scroll-stacking studies, a connected standards map and a guided two-step questionnaire. Public aggregate results, the email waitlist and private analytics dashboard are functional today.

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

A [SleekViber Neon project](https://console.neon.tech/app/projects/nameless-salad-69410646) was provisioned on 14 October 2026 in AWS US East (Ohio), with a `production` branch (`br-soft-band-b4i4qv8b`) and the `sleekviber` database. The configured connection has been verified, the survey schema created, and the local records migrated: 3 poll responses, 4 survey starts, 0 waitlist entries and 6 legacy responses. SQLite remains intact, with a fresh verified backup. Reuse this project rather than creating a duplicate.

The Vercel project `sleekviber` is live at [its public production URL](https://sleekviber-shreyanshkrishna279-6139s-projects.vercel.app), with Node 24.x, Next.js and Neon storage. Its IDs are recorded in `data/vercel-setup.json`. Anonymous site/health/results requests succeeded; private statistics require an admin session. Production secrets are scoped only to Production. Reuse this project; custom-domain DNS is managed separately.

1. Connect the existing SleekViber Neon project to the Vercel project's Storage integration. Keep function placement near the database region.
2. Set the connection URL as `DATABASE_URL` in Vercel. Keep it server-only; never prefix it with `NEXT_PUBLIC_`. Set `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` and `NEXT_PUBLIC_SITE_URL` as well.
3. For the one-time setup, put the intended database's connection URL in your ignored `.env.local` or export it in your shell. Run `npm run db:setup`. This creates the five tables and indexes without resetting existing data. Run it again on an existing hosted database to add the new request-limit table.
4. Run `npm run db:migrate -- --dry-run` to inspect local record counts, then `npm run db:migrate` to transfer the existing SQLite records. The migration reads a consistent source snapshot, commits inserts in one hosted transaction, preserves existing IDs, and leaves SQLite untouched. Rerunning it does not duplicate those records.
5. Run `npm run db:check` to verify the hosted connection and table counts, then deploy/redeploy. Set the Vercel Node version to 24.x; this is also declared in `package.json`.

Use separate Neon branches/databases for Preview and Production so preview votes do not enter live analytics. Setup/migrate against the intended branch explicitly. No cloud connection is attempted during `next build`, and schema setup is an explicit command rather than work performed on each function request.

Without `DATABASE_URL`, `npm run db:check` validates the local SQLite integrity and reports counts. `npm run db:backup` makes a new verified SQLite snapshot in `data/backups/`, including committed WAL data. Backups are ignored by Git and never overwrite a prior backup. Keep durable copies outside the deployment checkout before replacing a server or migrating. Hosted backups are managed through Neon.

After `npm run build`, run `npm run test:database` for isolated persistence, validation, concurrent duplicate, admin-access, security-header, asset and backup tests. Run `npm run test:security` for request parsing and session checks, and `npm run lint` for application linting. The suites use temporary databases and never submit test votes to the real database. Hosted queries still require verification with a real Neon connection URL. `/api/health` reports storage readiness without exposing records or credentials. See [SECURITY.md](SECURITY.md) for the current audit evidence and remaining limitations.

## Production domain

The requested public address is `https://sleekviber.publicvm.com`, managed through DNSExit. [DNSExit supports full DNS control and external hosting for its free hostnames](https://dnsexit.com/domains/free-second-level-domains/). The hostname is now attached to the existing Vercel project but is not verified. Browser access to Vercel and DNSExit works; the connector still returns 403. The hosted database connection, schema and record migration are verified; Production Secrets are saved in Vercel.

Vercel currently requires a CNAME from `sleekviber.publicvm.com` to `bc2730f955f5ddd7.vercel-dns-017.com`, plus ownership verification through a TXT record at `_vercel.publicvm.com` because the parent domain is associated with another Vercel account. Get the current TXT value from the project's domain settings. `_vercel.sleekviber.publicvm.com` is a different hostname and will not satisfy this challenge. If the DNSExit account cannot edit the required parent-zone record, ask DNSExit to assist with verification or Vercel to provide verification scoped to the delegated hostname. Do not redirect traffic before the hosted app and database pass verification.

The signed-in DNSExit editor was inspected: both TXT and advanced records append `.sleekviber.publicvm.com` to the name. An absolute-name preview also appends that suffix, so the panel cannot create the required parent-zone TXT record. No incorrect record was saved and the existing A/CNAME records remain unchanged.

Set `NEXT_PUBLIC_SITE_URL=https://sleekviber.publicvm.com` in Vercel's Production environment for social metadata when connecting the domain. Attach the exact hostname to the existing SleekViber Vercel project and enter the DNS/ownership records it returns in the [DNSExit domain panel](https://dnsexit.com/Direct.sv?cmd=userDomainPanel&domainname=sleekviber.publicvm.com); do not assume a universal A record or CNAME target. Preserve unrelated DNS records. Stage and verify the production build, database migration, poll results, admin authentication, HTTPS and public access before directing the domain to it.

## Experience
- Next.js App Router, TypeScript, Tailwind, GSAP ScrollTrigger and Lenis.
- Black, paper, charcoal and vermilion; locally hosted Clash Display and General Sans.
- React Bits ScrollStack, GridMotion, Stepper, ColorBends and Threads and Magic UI Animated Beam, Animated List, Number Ticker and Interactive Hover Button supply contextual interactions. Existing ScrollFloat, TextPressure, SplitText and PixelTransition remain adapted to the shared design system. Sources and licenses are credited at public/credits/DESIGN-NOTICE.txt.
- The centered “Beyond almost.” hero adapts Aceternity's free Hero Section One over React Bits ColorBends, with a stationary survey action. Motion runs automatically with no visible playback controls, honors live reduced-motion changes, and stops outside the visible hero or in a hidden tab. Rendering is capped at 30fps and DPR 1.25; stable reading scrims and an animated CSS fallback preserve the message and actions when the decorative visual is unavailable. The fallback uses the same visibility and reduced-motion gates.
- Three React Bits problem scenes stack at all widths when motion is enabled; their controls illustrate original design, a Form→Logic→Data request lifecycle and Visitor/Member permissions. A narrow-screen adaptive pin lets tall chapter copy scroll before bringing interaction panels into view. Fully covered chapters become inert and regain eligibility when uncovered; reduced motion restores normal flow. Connected request beams loop while active and visible. The studies describe intent while SleekViber is in development.
- The wire landscape uses Canvas 2D and its full brand signature fits the viewport. Six fixed standards controls surround a connected core, update the preserved descriptions and loop only the selected beam while in view. Mobile keeps all six choices in two columns, the core between top and bottom choices and visible SVG connections. Live reduced-motion changes retain static routes and stop repetition immediately.
- Fine-pointer scrolling uses one Lenis instance integrated with GSAP, with shorter wheel inertia and anchor transitions. Touch scrolling remains native; passive touch input drives the shader fields and resets on release/cancel. TextPressure responds to scroll on coarse-pointer screens. Reduced motion retains readable content and working state controls; disabling reduction restores motion only when the surface is eligible.
- The guided questionnaire preserves answers across Back/Next, moves focus into the active pane and waits for the server save before showing its receipt. The existing question order, three-choice limit, exclusive All option, pending state and retry feedback remain.
- A separate native disclosure below the questionnaire shows actual public counts with Number Ticker and answer percentages. It uses the existing database through `/api/responses/results`; that route queries only aggregates and exposes total/today/q1/q2. The private `/api/responses/stats` remains protected. Legacy responses and individual response records are excluded from the public view. Results refresh every 30 seconds while open; loading/error/empty states remain explicit.
- The closing waitlist sits over a lazy-loaded, automatically animated Threads field with no visible playback controls, offscreen/hidden-tab suspension, live reduced-motion handling and an animated CSS fallback that follows the same gates. The email form uses a fixed hover action and preserves its existing save contract and live feedback.
See PRODUCT.md for scope, DESIGN.md for the current visual system and REBUILD-AUDIT.md for current screenshots and acceptance checks. The feature copy describes the platform in development, not functionality already available in this landing. Older audit files describe superseded designs.
